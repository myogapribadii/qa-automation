/// <reference types="cypress" />

/**
 * DEKLARASI VARIABEL GLOBAL
 */
let nomorPermohonan;
let idDcDataDasar;
let dataLobByPg;

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
                cy.visit(urls.loginDev);
                cy.contains('Welcome to JaGuarS').should('be.visible');
                cy.loginAs('staff');
                cy.url({ timeout: 15000 }).should('include', '/dashboard');
            });
            // Mengarahkan ke dashboard setelah session dipastikan aman
            cy.visit(urls.dashboardDev);
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
        if (!value) return;

        const inputSelector = `input[aria-label="${label}"]`;

        // 1. Pastikan input tersedia dan berikan alias
        cy.get(inputSelector, { timeout: 20000 })
            .should('be.visible')
            .should('not.be.disabled')
            .as('activeInput');

        // 2. Klik untuk buka menu. Jika menu tidak muncul, coba klik ulang
        cy.get('@activeInput').click({ force: true });

        // Cek apakah menu benar-benar terbuka di DOM
        cy.get('body', { log: false }).then(($body) => {
            if ($body.find('.q-menu:visible').length === 0) {
                cy.get('@activeInput').click({ force: true });
            }
        });

        // 3. Cari di menu yang paling baru muncul (.last())
        cy.get('.q-menu:visible', { timeout: 15000 })
            .last()
            .within(() => {
                // Gunakan Regex Partial Match dan Case Insensitive
                // Kita ambil 15 karakter pertama saja jika value terlalu panjang
                const searchTerm = value.toString().substring(0, 15);

                cy.contains('.q-item', new RegExp(searchTerm, 'i'), { timeout: 10000 })
                    .scrollIntoView()
                    .should('be.visible')
                    .click({ force: true });
            });

        // 4. Sinkronisasi: Tunggu menu tertutup agar tidak menabrak field berikutnya
        cy.get('.q-menu', { timeout: 5000 }).should('not.exist');
        cy.log(`✅ Selected "${value}" for "${label}"`);
    }

    // ============================================================
    // IT BLOCK 1: INPUT PERMOHONAN
    // ============================================================
    it('1. Permohonan Penjaminan Non Cash Loan', () => {
        cy.intercept('GET', '**/api/full-auth/plafon-gurantee/permohonan-penjaminan-guarantee-lov/avail-pg**').as('getPg');
        cy.intercept('GET', '**/api/all-auth/master/lov/lob-by-pg**').as('getLobByPg');
        cy.intercept('GET', '**/api/all-auth/master/lov/produk-by-pg**').as('getProdukByPg');
        cy.intercept('GET', '**/api/all-auth/master/lov/subproduk-by-uker**').as('getSubProduk');
        cy.intercept('GET', '**/api/all-auth/master/lov/mitra-penjaminan-by-uker**').as('getMitra');
        cy.intercept('GET', '**/api/all-auth/master/lov/mitra-obligee**').as('getMitraObligee');
        cy.intercept('GET', '**/api/all-auth/master/lov/mitra-cabang-by-mitra**').as('getMitraCabangObligee');
        cy.intercept('GET', '**/api/all-auth/master/lov/mitra-cabang-by-mitra-and-cabang**').as('getMitraCabangPenerimaJaminan');
        cy.intercept('GET', '**/api/all-auth/setting/lov/dc-data-dasar**').as('getDcDataDasar');

        cy.contains('.q-item__section', 'Permohonan').click();
        cy.contains('.q-item__section', 'Non Cash Loan').click();
        cy.wait(1000);

        // Pastikan halaman benar-benar sudah load
        cy.contains('.q-field__label', 'Penjaminan atas PG', { timeout: 15000 })
            .should('be.visible')
            .wait(2000); // Jeda kecil untuk memastikan UI Quasar benar-benar siap
        selectQ('Penjaminan atas PG', 'Ya');

        // 2. Tunggu API Plafond Selesai
        cy.wait('@getPg', { timeout: 20000 });
        cy.get('input[aria-label="Nomor Plafond Guarantee"]')
            .should('not.be.disabled')
            .wait(2000); // Jeda kecil untuk kestabilan UI Quasar
        selectQ('Nomor Plafond Guarantee', 'PGJKT00000012');

        cy.wait('@getLobByPg', { timeout: 20000 })
        cy.get('input[aria-label="Lob"]')
            .should('not.be.disabled')
            .wait(2000); // Jeda kecil untuk kestabilan UI Quasar
        selectQ('Lob', 'SURETYSHIP');

        cy.wait('@getProdukByPg', { timeout: 20000 })
        cy.get('input[aria-label="Produk"]')
            .should('not.be.disabled')
            .wait(2000); // Jeda kecil untuk kestabilan UI Quasar
        selectQ('Produk', 'KREDIT KONTRA BANK GARANSI');

        cy.wait('@getSubProduk', { timeout: 20000 })
        cy.get('input[aria-label="Sub Produk"]')
            .should('not.be.disabled')
            .wait(5000); // Jeda kecil untuk kestabilan UI Quasar
        selectQ('Sub Produk', 'Jaminan Pelaksanaan - KREDIT KONTRA BANK GARANSI');

        // Tunggu API
        cy.wait('@getMitra', { timeout: 120000 });
        cy.get('input[aria-label="Mitra"]')
            .should('not.be.disabled')
            .wait(10000); // Jeda kecil untuk kestabilan UI Quasar
        selectQ('Mitra', '008 - PT BANK MANDIRI PERSERO TBK');

        cy.wait('@getDcDataDasar', { timeout: 20000 });
        cy.get('input[aria-label="PKS (Perjanjian Kerja Sama)"]')
            .should('not.be.disabled')
            .wait(2000); // Jeda kecil untuk kestabilan UI Quasar
        selectQ('PKS (Perjanjian Kerja Sama)', 'JMK/PKS/CAC/CBC/041124');

        cy.wait('@getMitraObligee')
        cy.get('input[aria-label="Nama Obligee"]').should('be.visible')
        selectQ('Nama Obligee', '80904 - ALAM SUTERA REALTY Tbk');

        cy.wait('@getMitraCabangObligee', { timeout: 30000 });
        cy.get('input[aria-label="Cabang Obligee"]')
            .should('be.visible')
            .should('not.be.disabled')
            .wait(2000); // Beri jeda 0.5 detik untuk sinkronisasi DOM Quasar
        selectQ('Cabang Obligee', '321 - OBLIGEE CABANG SURABAYA');

        // cy.wait('@getMitraCabangPenerimaJaminan', { timeout: 30000 }).then((interception) => {
        //     const data = interception.response.body;

        //     // Menampilkan pesan di log Cypress (sidebar kiri)
        //     cy.log(`✅ Data Cabang Ditemukan: ${data.length} item`);

        //     // Menampilkan tabel di Console F12 agar bisa di-copy teksnya
        //     console.log('DAFTAR MITRA CABANG:', data);
        //     console.table(data);

        //     // Opsional: Cek apakah data pertama mengandung teks yang kamu cari
        //     if (data.length > 0) {
        //         cy.log('Contoh Value Pertama:', data[0].namaMitraCabang || data[0].label);
        //     }
        // });

        // Tunggu API Cabang selesai
        cy.wait('@getMitraCabangPenerimaJaminan', { timeout: 30000 });
        cy.get('input[aria-label="Mitra Cabang Penerima Jaminan"]')
            .should('be.visible')
            .should('not.be.disabled')
            .wait(2000); // Beri jeda 0.5 detik untuk sinkronisasi DOM Quasar
        selectQ('Mitra Cabang Penerima Jaminan', '12330A');

        // cy.get('input[aria-label="Nama Alias Obligee / Penerima Jaminan"]').type('ini merupakan nama PPK');
        // cy.get('input[aria-label*="PPK"]').click({ force: true });
        // cy.contains('.q-menu:visible .q-item__label', 'Nama Pejabat Pembuat Komitmen (PPK)').click({ force: true });

        cy.get('input[aria-label="Nama Proyek"]').type('Proyek Otomasi Pribadi');
        // cy.get('input[aria-label="Nomor Fax"]').type('01902930123');
        cy.get('input[aria-label="Nominal Pokok Pembiayaan"]').type('1000000');
        cy.get('input[aria-label="Nilai Bank Garansi"]').type('1000000');
        cy.get('input[aria-label="Nilai Proyek"]').type('500000000');
        cy.get('input[aria-label="Nomor Surat Permohonan"]').type('REF/SRT/PRIBADI');
        cy.get('input[aria-label="Nomor Kontrak"]').type('REF/KTR/PRIBADI');
        cy.get('input[aria-label="Jangka Waktu Jaminan"]').type('120');
        cy.get('input[aria-label="Jangka Waktu Proyek"]').type('120');
        // cy.get('input[aria-label="Setoran Jaminan"]').type('0');

        const tgl = '2028-02-02';
        cy.get('input[aria-label="Tanggal Surat Permohonan"]').clear({ force: true }).type(tgl, { force: true }).blur();
        cy.get('input[aria-label="Tanggal Periode Awal"]').clear({ force: true }).type(tgl, { force: true }).blur();
        cy.get('input[aria-label="Tanggal Kontrak"]').clear({ force: true }).type(tgl, { force: true }).blur();

        selectQ('Provinsi Proyek', 'DKI Jakarta');
        selectQ('Pemilik Proyek', 'BUMN');
        selectQ('Jenis Garansi', 'F4202 - Performance Bonds');
        selectQ('Tujuan Garansi', 'Dalam Rangka Penerimaan Pinjaman');
        selectQ('Skema Penalty', 'Penalty');
        selectQ('Sektor', 'Jasa & Perdagangan');
        selectQ('Sinergi BUMN', 'BUMD');
        // selectQ('Flag Sinergi BUMN', 'Tidak');
        selectQ('Sumber Anggaran', 'Perpress');
        selectQ('Metode Perhitungan', 'H + 1');

        cy.get('input[aria-label="Coverage %"]').type('100');
        cy.contains('HITUNG IJP').click();

        cy.pause();
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

    // ============================================================
    // IT BLOCK 2: DRAFT SP
    // ============================================================
    it('2. OTS dan Draft SP', () => {
        cy.fixture('urls').then((urls) => { cy.visit(urls.draftSpDev); });

        cy.contains('.q-item', 'Cari').should('be.visible').click();
        cy.get('.q-icon').contains('add').click();

        cy.then(() => {
            selectQ('Field', 'Nomor Permohonan');
            selectQ('Opsi', 'Equal');
            safeType('Nomor Permohonan', nomorPermohonan);
            cy.contains('button', 'Search').click();

            cy.contains('.q-icon', 'edit', { timeout: 15000 }).should('be.visible').click();

            // LOGIKA LOV PENOMORAN
            cy.intercept('GET', `**/api/all-auth/setting/lov/penomoran-surat-by-data-dasar?idDcDataDasar=${idDcDataDasar}`).as('getLOV');

            cy.get('input[aria-label="Format Penomoran Surat"]').should('be.visible').click();
            cy.wait('@getLOV', { timeout: 20000 });

            cy.get('.q-menu:visible').should('be.visible');
            cy.contains('.q-menu:visible .q-item', 'SP Surety Bond').click();

            selectQ('Format Surat', 'Penerbitan SK Cetak PDF');
            cy.contains('button', 'Submit').should('be.enabled').click();
        });
    });

    // ============================================================
    // IT BLOCK 3: VERIFIKASI ANALISA
    // ============================================================
    it('3. Verifikasi dan Analisa Penjaminan', () => {
        cy.fixture('urls').then((urls) => { cy.visit(urls.verifikasiAnalisaDev); });

        cy.contains('.q-item', 'Cari').click();
        cy.get('.q-icon').contains('add').click();

        cy.then(() => {
            selectQ('Field', 'Nomor Permohonan');
            selectQ('Opsi', 'Equal');
            safeType('Nomor Permohonan', nomorPermohonan);
            cy.contains('button', 'Search').click();
            cy.contains('.q-icon', 'settings').click();

            selectQ('Pilih Keputusan', 'Tidak Ada Revisi');
            cy.contains('button', 'Next').click();

            // Analisa 5C
            cy.contains('td', '> 10 tahun').parent('tr').find('.q-radio').click();
            cy.contains('td', '80% < RL <= 100%').parent('tr').find('.q-radio').click();
            cy.contains('td', '> 4 Proyek yang sama').parent('tr').find('.q-radio').click();
            selectQ('Jenis Agunan', 'Tanpa Agunan');

            cy.contains('button', 'Next').click();

            // Ceklis Dokumen
            cy.contains('td', 'Copy draft kontrak').parent('tr').find('.q-checkbox[tabindex="0"]').click();
            cy.contains('td', 'copy surat penunjukan').parent('tr').find('.q-checkbox[tabindex="0"]').click();

            cy.contains('button', 'Next').click();

            safeType('Persentase Similarity (%)', '55');
            safeType('Informasi Inaproc LKPP', 'LKPP Terlampir');
            safeType('Isu Negatif', 'Clean');

            // Helper upload PBK
            const uploadPBK = (label) => {
                cy.contains('.q-field__label', label).closest('.q-field__inner').find('input[type="file"]').selectFile('cypress/fixtures/tanda_tangan_1.png', { force: true });
                cy.contains(label).closest('.q-field').should('contain', 'tanda_tangan_1.png');
            };
            uploadPBK('Upload Dokumen Dukcapil');
            uploadPBK('Upload Dokumen Inaproc LKPP');
            uploadPBK('Upload Dokumen Isu Negatif');

            cy.contains('button', 'Next').click();

            cy.intercept('POST', '**/api/full-auth/penjaminan/analisa/submit-draft**').as('submitVerifikasi');
            cy.contains('button', 'Next').click();
            cy.wait('@submitVerifikasi').its('response.body.message').should('eq', 'OK');
        });
    });

    // ============================================================
    // IT BLOCK 4: KEPUTUSAN (PUT METHOD)
    // ============================================================
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
    });
});