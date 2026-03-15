/// <reference types="cypress" />

/**
 * DEKLARASI VARIABEL GLOBAL
 */
let nomorPermohonan;
let idDcDataDasar;

Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop')) return false;
});

describe('Permohonan Penjaminan E2E Flow', () => {

    afterEach(function () {
        if (this.currentTest.state === 'failed') {
            Cypress.runner.stop();
        }
    });

    beforeEach(() => {
        cy.fixture('urls').then((urls) => {
            cy.session('login-staff', () => {
                cy.visit(urls.login);
                cy.contains('Welcome to JaGuarS').should('be.visible');
                cy.loginAs('staff');
                cy.url({ timeout: 15000 }).should('include', '/dashboard');
            });
            // Mengarahkan ke dashboard setelah session dipastikan aman
            cy.visit(urls.dashboard);
        });
    });

    /**
     * HELPERS
     */
    function safeType(label, value) {
        cy.get(`[aria-label="${label}"]`)
            .should('exist')
            .scrollIntoView()
            .should('be.visible')
            .clear({ force: true })
            .type(value, { delay: 30, force: true })
            .should('have.value', value);
    }

    function selectQ(label, value) {
        cy.get(`input[aria-label="${label}"]`).should('be.visible').click({ force: true });
        // Pastikan menu muncul sebelum mencari item
        cy.get('.q-menu:visible', { timeout: 10000 }).should('be.visible');
        cy.contains('.q-menu:visible .q-item', value, { timeout: 10000 }).click({ force: true });
    }

    // IT BLOCK 1: INPUT PERMOHONAN
    // ============================================================
    it('1. Permohonan Penjaminan Non Cash Loan', () => {
        cy.intercept('GET', '**/api/full-auth/plafon-gurantee/permohonan-penjaminan-guarantee-lov/avail-pg**').as('getPg');
        cy.intercept('GET', '**/api/all-auth/master/lov/lob-by-pg**').as('getLobByPg');
        cy.intercept('GET', '**/api/all-auth/master/lov/produk-by-pg**').as('getProdukByPg');
        cy.intercept('GET', '**/api/all-auth/master/lov/subproduk-by-uker**').as('getSubProdukByPg');
        cy.intercept('GET', '**/api/all-auth/setting/lov/dc-data-dasar**').as('getDcDataDasar');
        cy.intercept('GET', '**/api/all-auth/master/lov/mitra-obligee**').as('getMitraObligee');
        cy.intercept('GET', '**/api/all-auth/master/lov/mitra-cabang-by-mitra**').as('getMitraCabangObligee');
        cy.intercept('GET', '**/api/all-auth/master/lov/mitra-penjaminan-by-uker**').as('getMitraPenerimaJaminan');
        cy.intercept('POST', '**/api/full-auth/penjaminan/std-penjaminan/create**').as('createPermohonan');

        cy.contains('.q-item__section', 'Permohonan').click();
        cy.contains('.q-item__section', 'Non Cash Loan').click({ timeout: 15000 });
        cy.contains('.q-field__label', 'Penjaminan atas PG', { timeout: 15000 })
            .should('be.visible')
            .wait(500);
        selectQ('Penjaminan atas PG', 'Ya');

        cy.wait('@getPg', { timeout: 20000 });
        cy.get('input[aria-label="Nomor Plafond Guarantee"]')
            .should('not.be.disabled')
            .wait(500);
        selectQ('Nomor Plafond Guarantee', '50');

        cy.wait('@getLobByPg', { timeout: 20000 });
        cy.get('input[aria-label="Lob"]')
            .should('not.be.disabled')
            .wait(500);
        selectQ('Lob', 'SURETYSHIP');

        cy.wait('@getProdukByPg', { timeout: 20000 });
        cy.get('input[aria-label="Produk"]')
            .should('not.be.disabled')
            .wait(500);
        selectQ('Produk', 'SURETY BOND');

        cy.wait('@getSubProdukByPg', { timeout: 20000 });
        cy.get('input[aria-label="Sub Produk"]')
            .should('not.be.disabled')
            .wait(500);
        selectQ('Sub Produk', 'JAMINAN PELAKSANAAN - SURETY BOND');

        cy.get('input[aria-label="PKS (Perjanjian Kerja Sama)"]')
            .should('not.be.disabled')
            .wait(500);
        selectQ('PKS (Perjanjian Kerja Sama)', '17/SE/6/VII/2024HKL');

        cy.wait('@getMitraObligee');
        // Khusus Obligee menggunakan type untuk filter
        cy.get('input[aria-label="Obligee/Penerima Jaminan"]').parent().type('80904 - ALAM SUTERA REALTY Tbk');
        cy.contains('.q-item', '80904 - ALAM SUTERA REALTY Tbk').click();

        cy.wait('@getMitraCabangObligee');
        selectQ('Cabang Obligee', '321 - OBLIGEE CABANG SURABAYA');

        cy.get('input[aria-label="Nama Alias Obligee / Penerima Jaminan"]').type('ini merupakan nama PPK');
        cy.get('input[aria-label*="PPK"]').click({ force: true });
        cy.contains('.q-menu:visible .q-item__label', 'Nama Pejabat Pembuat Komitmen (PPK)').click({ force: true });

        cy.get('input[aria-label="Nama Proyek"]').type('Proyek Otomasi Pribadi');
        cy.get('input[aria-label="Nominal Pokok Pembiayaan"]').type('100000000');
        cy.get('input[aria-label="Nilai Proyek"]').type('5000000000');
        cy.get('input[aria-label="Nomor Surat Permohonan"]').type('REF/SRT/');
        cy.get('input[aria-label="Nomor Kontrak"]').type('REF/KTR/PRIBADI');
        cy.get('input[aria-label="Jangka Waktu Jaminan (hari)"]').type('120');
        cy.get('input[aria-label="Jangka Waktu Proyek (hari)"]').type('120');

        const tgl = '2028-02-02';
        cy.get('input[aria-label="Tanggal Surat Permohonan"]').clear({ force: true }).type(tgl, { force: true }).blur();
        cy.get('input[aria-label="Tanggal Periode Awal"]').clear({ force: true }).type(tgl, { force: true }).blur();
        cy.get('input[aria-label="Tanggal Kontrak"]').clear({ force: true }).type(tgl, { force: true }).blur();

        selectQ('Jenis Persyaratan', 'Conditional');
        selectQ('Provinsi Proyek', 'DKI Jakarta');
        selectQ('Pemilik Proyek', 'BUMN');
        selectQ('Jenis Garansi', 'F4202 - Performance Bonds');
        selectQ('Tujuan Garansi', 'Dalam Rangka Penerimaan Pinjaman');
        selectQ('Skema Penalty', 'Penalty');
        selectQ('Sektor', 'Jasa & Perdagangan');
        selectQ('Sinergi BUMN', 'BUMN');
        selectQ('Flag Sinergi BUMN', 'Tidak');
        selectQ('Sumber Anggaran', 'Perpress');
        selectQ('Metode Perhitungan', 'H + 1');

        cy.get('input[aria-label="Persentase Coverage %"]').type('100');
        cy.contains('Perhitungan IJP').click();
        cy.contains('Next').click();

        // Upload Dokumen
        cy.intercept('POST', '**/upload-dokumen**').as('uploadDokumen');
        const fileP = 'cypress/fixtures/tanda_tangan_1.png';
        const uploadFunc = (label) => {
            cy.contains('td.nama-dokumen', label).parent('tr').find('input[type="file"]').selectFile(fileP, { force: true });
            cy.wait('@uploadDokumen');
        };
        uploadFunc('copy surat penunjukan');
        uploadFunc('Copy draft kontrak');

        cy.intercept('POST', '**/api/full-auth/penjaminan/std-penjaminan/submit-permohonan**').as('submitPermohonan');
        cy.contains('button', 'Submit').click();

        cy.wait('@submitPermohonan').then((interception) => {
            nomorPermohonan = interception.response.body.nomorPermohonan;
            idDcDataDasar = interception.response.body.idDcDataDasar;
            cy.log(`DATA DISIMPAN - NO: ${nomorPermohonan} | ID: ${idDcDataDasar}`);
        });

        cy.contains('button', 'OK').click();
    });

    // IT BLOCK 2: DRAFT SP
    // ============================================================
    it('2. OTS dan Draft SP', () => {
        cy.fixture('urls').then((urls) => { cy.visit(urls.draftSp); });

        cy.contains('.q-item', 'Cari').should('be.visible').click();
        cy.get('.q-icon').contains('add').click();

        cy.then(() => {
            selectQ('Field', 'Nomor Permohonan');
            selectQ('Opsi', 'Equal');
            safeType('Nomor Permohonan', nomorPermohonan);
            cy.contains('button', 'Search').click();

            cy.contains('.q-icon', 'edit', { timeout: 15000 })
                .should('be.visible').click()
                .wait(1000); // Tunggu sejenak untuk memastikan data sudah ter-load sebelum klik next

            // LOGIKA LOV PENOMORAN
            // cy.intercept('GET', `**/api/all-auth/setting/lov/penomoran-surat-by-data-dasar?idDcDataDasar=${idDcDataDasar}`).as('getLOV');

            // cy.wait('@getLOV', { timeout: 20000 });
            cy.get('input[aria-label="Format Penomoran Surat"]').should('be.visible').click();
            cy.get('.q-menu:visible').should('be.visible');
            cy.contains('.q-menu:visible .q-item', 'SP Surety Bond').click();

            selectQ('Format Surat', 'Penerbitan SK Cetak PDF');

            cy.contains('button', 'Submit').should('be.enabled').click();
        });
    });

    // IT BLOCK 3: VERIFIKASI ANALISA
    // ============================================================
    it('3. Verifikasi dan Analisa Penjaminan', () => {
        cy.fixture('urls').then((urls) => { cy.visit(urls.verifikasiAnalisa); });

        cy.contains('.q-item', 'Cari').click();
        cy.get('.q-icon').contains('add').click();

        cy.then(() => {
            selectQ('Field', 'Nomor Permohonan');
            selectQ('Opsi', 'Equal');
            safeType('Nomor Permohonan', nomorPermohonan);
            cy.contains('button', 'Search').click();
            cy.contains('.q-icon', 'settings').click();

            // selectQ('Pilih Keputusan', 'Tidak Ada Revisi');
            cy.contains('button', 'Next').click();

            // Analisa 5C
            // cy.contains('td', '> 10 tahun').parent('tr').find('.q-radio').click();
            // cy.contains('td', '80% < RL <= 100%').parent('tr').find('.q-radio').click();
            // cy.contains('td', '> 4 Proyek yang sama').parent('tr').find('.q-radio').click();
            selectQ('Jenis Agunan', 'Tanpa Agunan');

            cy.contains('button', 'Next').click();

            // Ceklis Dokumen
            cy.contains('td', 'Copy draft kontrak').parent('tr').find('.q-checkbox[tabindex="0"]').click();
            cy.contains('td', 'copy surat penunjukan').parent('tr').find('.q-checkbox[tabindex="0"]').click();

            cy.contains('button', 'Submit').click();

            // safeType('Persentase Similarity (%)', '55');
            // safeType('Informasi Inaproc LKPP', 'LKPP Terlampir');
            // safeType('Isu Negatif', 'Clean');

            // Helper upload PBK
            // const uploadPBK = (label) => {
            //     cy.contains('.q-field__label', label).closest('.q-field__inner').find('input[type="file"]').selectFile('cypress/fixtures/tanda_tangan_1.png', { force: true });
            //     cy.contains(label).closest('.q-field').should('contain', 'tanda_tangan_1.png');
            // };
            // uploadPBK('Upload Dokumen Dukcapil');
            // uploadPBK('Upload Dokumen Inaproc LKPP');
            // uploadPBK('Upload Dokumen Isu Negatif');

            // cy.contains('button', 'Next').click();

            // cy.intercept('POST', '**/api/full-auth/penjaminan/analisa/submit-draft**').as('submitVerifikasi');
            // cy.contains('button', 'Next').click();
            // cy.wait('@submitVerifikasi').its('response.body.message').should('eq', 'OK');
        });
    });

    // // IT BLOCK 4: KEPUTUSAN
    // // ============================================================
    it('4. Keputusan Penjaminan', () => {
        // Navigasi manual jika URL fixture tidak spesifik ke sub-menu
        cy.contains('.q-item__section', 'Keputusan Penjaminan').click();
        cy.contains('.q-item__section', 'Memorandum Analisa Penjaminan').click();

        cy.contains('.q-item', 'Cari').click();
        cy.get('.q-icon').contains('add').click();

        cy.then(() => {
            selectQ('Field', 'Nomor Permohonan');
            selectQ('Opsi', 'Equal');
            safeType('Nomor Permohonan', nomorPermohonan);
            cy.contains('button', 'Search').click();

            cy.contains('.q-icon', 'settings').click();

            cy.pause(); // Debugging: Pastikan data sudah ter-load sebelum klik next

            cy.contains('button', 'Next').click();

            // Textarea Quasar
            cy.contains('.q-field__label', 'Syarat Umum').closest('.q-field').find('textarea').type('Sesuai analisa', { force: true });
            cy.contains('.q-field__label', 'Syarat Khusus').closest('.q-field').find('textarea').type('None', { force: true });

            selectQ('Pilih Keputusan', 'Setuju');

            cy.intercept('PUT', '**/api/full-auth/penjaminan/keputusan/update**').as('updateKeputusan');
            cy.contains('button', 'Submit').click();

            cy.wait('@updateKeputusan').then((xhr) => {
                expect(xhr.response.statusCode).to.eq(200);
                expect(xhr.response.body.nomorPermohonan).to.eq(nomorPermohonan);
            });
        });

        // // // Pastikan logout setelah semua alur selesai
        cy.logoutAs('staff');

        cy.fixture('urls').then((urls) => {
            cy.visit(urls.login);
            cy.contains('Welcome to JaGuarS').should('be.visible');
            cy.loginAs('managerBisnis');
            cy.url({ timeout: 15000 }).should('include', '/dashboard');
        });

        cy.contains('.q-item__section', 'Keputusan Penjaminan').click();
        cy.contains('.q-item__section', 'Persetujuan Memorandum Analisa Penjaminan').click();

        cy.contains('.q-item', 'Cari').click();
        cy.get('.q-icon').contains('add').click();
        selectQ('Field', 'Nomor Permohonan');
        selectQ('Opsi', 'Equal');
        safeType('Nomor Permohonan', nomorPermohonan);
        cy.contains('button', 'Search').click();

        cy.contains('.q-icon', 'settings').click();
        cy.contains('button', 'Next').click();
        selectQ('Hasil Keputusan Komite penjaminan', 'Approve');
        cy.contains('button', 'Submit').click();

        cy.wait('@updateKeputusan').then((xhr) => {
            expect(xhr.response.statusCode).to.eq(200);
            // expect(xhr.response.body.nomorPermohonan).to.eq(nomorPermohonan);
        });

        cy.logoutAs('managerBisnis');

        cy.fixture('urls').then((urls) => {
            cy.visit(urls.login);
            cy.contains('Welcome to JaGuarS').should('be.visible');
            cy.loginAs('managerKlaim');
            cy.url({ timeout: 15000 }).should('include', '/dashboard');
        });

        cy.contains('.q-item__section', 'Keputusan Penjaminan').click();
        cy.contains('.q-item__section', 'Persetujuan Keputusan Penjaminan').click();

        cy.contains('.q-item', 'Cari').click();
        cy.get('.q-icon').contains('add').click();
        selectQ('Field', 'Nomor Permohonan');
        selectQ('Opsi', 'Equal');
        safeType('Nomor Permohonan', nomorPermohonan);
        cy.contains('button', 'Search').click();

        cy.contains('.q-icon', 'settings').click();
        cy.get('textarea[aria-label="Catatan"]')
            .type('Catatan', { force: true })
        cy.get('input[aria-label="Hasil Keputusan Komite penjaminan"]').click({ force: true });
        cy.get('.q-menu:visible').contains('.q-item', 'Approve').click();
        cy.contains('button', 'Next').click();

        cy.logoutAs('managerKlaim');

        cy.fixture('urls').then((urls) => {
            cy.visit(urls.login);
            cy.contains('Welcome to JaGuarS').should('be.visible');
            cy.loginAs('pemimpinCabang');
            cy.url({ timeout: 15000 }).should('include', '/dashboard');
        });

        cy.contains('.q-item__section', 'Keputusan Penjaminan').click();
        cy.contains('.q-item__section', 'Persetujuan Keputusan Penjaminan').click();

        cy.contains('.q-item', 'Cari').click();
        cy.get('.q-icon').contains('add').click();
        selectQ('Field', 'Nomor Permohonan');
        selectQ('Opsi', 'Equal');
        safeType('Nomor Permohonan', nomorPermohonan);
        cy.contains('button', 'Search').click();

        cy.contains('.q-icon', 'settings').click();
        cy.get('textarea[aria-label="Catatan"]')
            .type('Catatan', { force: true })
        cy.get('input[aria-label="Hasil Keputusan Komite penjaminan"]').click({ force: true });
        cy.get('.q-menu:visible').contains('.q-item', 'Approve').click();
        cy.contains('button', 'Next').click();

        cy.pause(); // Debugging: Pastikan keputusan sudah disubmit sebelum logout

        cy.logoutAs('pemimpinCabang');

        cy.fixture('urls').then((urls) => {
            cy.visit(urls.login);
            cy.contains('Welcome to JaGuarS').should('be.visible');
            cy.loginAs('staff');
            cy.url({ timeout: 15000 }).should('include', '/dashboard');
        });

        cy.contains('.q-item__section', 'Keputusan Penjaminan').click();
        cy.contains('.q-item__section', 'Daftar Penerbitan Perjanjian Penjaminan').click();

        cy.contains('.q-item', 'Cari').click();
        cy.get('.q-icon').contains('add').click();
        selectQ('Field', 'Nomor Permohonan');
        selectQ('Opsi', 'Equal');
        safeType('Nomor Permohonan', nomorPermohonan);
        cy.contains('button', 'Search').click();

        cy.contains('.q-icon', 'settings').click();

        // Helper upload Perjanjian Penjaminan
        cy.get('.q-field__control-container')
            .contains('Surat Perjanjian Penjaminan')
            .parent()
            .find('input[type="file"]')
            .selectFile('cypress/fixtures/slik_ojk.pdf', { force: true });

        cy.contains('button', 'Submit').click();


    });

    it('Penerimaan IJP', () => {
        cy.fixture('urls').then((urls) => { cy.visit(urls.penerimaanIjp); });

        cy.intercept('GET', '**/api/all-auth/setting/lov/rekening-ijp-cabang**').as('getRekeningIjp');
        cy.intercept('PUT', '**/api/full-auth/penjaminan/penerimaan-ijp/update**').as('updatePenerimaanIjp');

        cy.contains('.q-item', 'Cari').should('be.visible').click();
        cy.get('.q-icon').contains('add').click();

        cy.then(() => {
            selectQ('Field', 'Nomor Permohonan');
            selectQ('Opsi', 'Equal');
            safeType('Nomor Permohonan', nomorPermohonan);
            cy.contains('button', 'Search').click();

            cy.contains('.q-icon', 'settings', { timeout: 15000 }).should('be.visible').click();

            cy.wait('@getRekeningIjp', { timeout: 20000 });
            cy.get('input[aria-label="Nomor Rekening Giro Penagihan"]')
                .should('not.be.disabled')
                .click({ force: true })
                .type('0{enter}', { delay: 100, force: true })

            cy.get('input[aria-label="Metode Bayar"]')
                .should('not.be.disabled')
                .click({ force: true })
                .type('Virtual Account{enter}', { delay: 100, force: true })

            cy.get('input[aria-label="Tanggal Bayar Penagihan"]').clear({ force: true }).type(tglSp, { force: true }).blur();
            cy.get('input[aria-label="Tanggal SP"]').clear({ force: true }).type(tglSp, { force: true }).blur();

            cy.get('input[aria-label="Referensi Pembayaran"]').type('Ref/Pembayaran');
            cy.get('input[aria-label="Remark Pembayaran"]').type('Rem/Pembayaran');

            cy.contains('.q-uploader', 'Upload Bukti Pembayaran')
                .find('input[type="file"]')
                .selectFile('cypress/fixtures/tanda_tangan_1.png', { force: true })
                .wait(1000);

            cy.contains('button', 'Submit').should('be.enabled').click();
            cy.wait('@updatePenerimaanIjp', { timeout: 20000 }).then((interception) => {
                nomorPermohonan = interception.response.body.nomorPermohonan;
                idDcDataDasar = interception.response.body.idDcDataDasar;
                cy.log(`DATA DISIMPAN - NO: ${nomorPermohonan} | ID: ${idDcDataDasar}`);
            });

            cy.contains('button', 'OK').should('be.visible').click();
        });
    });

    // IT BLOCK 3: PENERBITAN SP
    // ============================================================
    it('Penerbitan SP', () => {
        cy.fixture('urls').then((urls) => { cy.visit(urls.penerbitanSP); });

        cy.intercept('POST', '**/api/full-auth/penjaminan/penerbitan-sp/terbit-sp**').as('terbitSp');

        cy.contains('.q-item', 'Cari').should('be.visible').click();
        cy.get('.q-icon').contains('add').click();

        cy.then(() => {
            selectQ('Field', 'Nomor Permohonan');
            selectQ('Opsi', 'Equal');
            safeType('Nomor Permohonan', nomorPermohonan);
            cy.contains('button', 'Search').click();

            cy.contains('.q-icon', 'settings', { timeout: 15000 }).should('be.visible').click();

            cy.get('input[aria-label="TTD Basah"]')
                .should('not.be.disabled')
                .click({ force: true })
                .type('T{enter}', { delay: 100, force: true })

            cy.contains('.q-radio', 'Cetak Sertifikat').click();
            cy.contains('.block', 'Proses', { timeout: 15000 }).should('be.visible').click();

            cy.wait('@terbitSp', { timeout: 60000 }).then((interception) => {
                // Memastikan server merespon sukses (200)
                expect(interception.response.statusCode).to.eq(200);
                cy.log('✅ API Terbit SP Berhasil, memulai pengecekan file download...');
            });


        });
    });
});