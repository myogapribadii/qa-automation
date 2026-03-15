/// <reference types="cypress" />

/**
 * DEKLARASI VARIABEL GLOBAL
 */
let nomorPermohonan;
let idDcDataDasar;
let nomorSertifikat;
const tgl = '2028-02-02';
const tglSp = '2026-03-01';

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
        cy.contains('.q-item__section', 'Non Cash Loan').click();
        cy.contains('.q-field__label', 'Penjaminan atas PG', { timeout: 15000 })
            .should('be.visible')
            .wait(2000);
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
        selectQ('Produk', 'KREDIT KONTRA BANK GARANSI');

        cy.wait('@getSubProdukByPg', { timeout: 20000 });
        cy.get('input[aria-label="Sub Produk"]')
            .should('not.be.disabled')
            .wait(500);
        selectQ('Sub Produk', 'Jaminan Pelaksanaan - KREDIT KONTRA BANK GARANSI');

        cy.wait('@getMitraPenerimaJaminan');
        cy.get('input[aria-label="Mitra"]');
        selectQ('Mitra', '008 - PT BANK MANDIRI (PERSERO) TBK');

        cy.wait('@getDcDataDasar', { timeout: 20000 });
        cy.get('input[aria-label="PKS (Perjanjian Kerja Sama)"]')
            .should('not.be.disabled')
            .wait(500);
        selectQ('PKS (Perjanjian Kerja Sama)', 'JMK/SIT/KBG/CAC/02112024');

        cy.wait('@getMitraObligee');
        cy.get('input[aria-label="Nama Obligee"]')
        selectQ('Nama Obligee', '80904 - ALAM SUTERA REALTY Tbk');
        cy.wait(1000);

        cy.wait('@getMitraCabangObligee');
        cy.get('input[aria-label="Cabang Obligee"]')
        selectQ('Cabang Obligee', '321 - OBLIGEE CABANG SURABAYA');

        cy.wait('@getMitraPenerimaJaminan');
        cy.get('input[aria-label="Mitra Cabang Penerima Jaminan"]');
        selectQ('Mitra Cabang Penerima Jaminan', '12330A - PT BANK MANDIRI (PERSERO) TBK . JAKARTA AHMAD YANI 1');

        // cy.get('input[aria-label="Nama Alias Obligee / Penerima Jaminan"]').type('ini merupakan nama PPK');
        // cy.get('input[aria-label*="PPK"]').click({ force: true });
        // cy.contains('.q-menu:visible .q-item__label', 'Nama Pejabat Pembuat Komitmen (PPK)').click({ force: true });

        cy.get('input[aria-label="Nama Proyek"]').type('Proyek Otomasi Pribadi');
        cy.get('input[aria-label="Nominal Pokok Pembiayaan"]').type('100000000');
        cy.get('input[aria-label="Nilai Bank Garansi"]').type('100000000');
        cy.get('input[aria-label="Nilai Proyek"]').type('500000000');
        cy.get('input[aria-label="Nomor Surat Permohonan"]').type('REF/SRT/');
        cy.get('input[aria-label="Nomor Kontrak"]').type('REF/KTR/PRIBADI');
        cy.get('input[aria-label="Jangka Waktu Jaminan"]').type('120');
        cy.get('input[aria-label="Jangka Waktu Proyek"]').type('120');
        cy.get('input[aria-label="Coverage %"]').type('100');

        const tgl = '2028-02-02';
        const tglSp = '2026-03-01';
        cy.get('input[aria-label="Tanggal Surat Permohonan"]').clear({ force: true }).type(tgl, { force: true }).blur();
        cy.get('input[aria-label="Tanggal Awal Periode"]').clear({ force: true }).type(tgl, { force: true }).blur();
        cy.get('input[aria-label="Tanggal Kontrak"]').clear({ force: true }).type(tgl, { force: true }).blur();

        selectQ('Jenis Persyaratan', 'Conditional');
        selectQ('Provinsi Proyek', 'DKI Jakarta');
        selectQ('Pemilik Proyek', 'BUMN');
        selectQ('Jenis Garansi', 'F4202 - Performance Bonds');
        selectQ('Tujuan Garansi', 'Dalam Rangka Penerimaan Pinjaman');
        selectQ('Skema Penalty', 'Penalty');
        selectQ('Sektor', 'Jasa & Perdagangan');
        selectQ('Sinergi BUMN', 'BUMD');
        selectQ('Kewenangan Sinergi BUMN ( Ya / Tidak )', 'Tidak');
        selectQ('Sumber Anggaran', 'Perpress');
        selectQ('Metode Perhitungan', 'H + 1');

        cy.contains('Perhitungan IJP').click();

        cy.contains('Next').click();

        cy.wait('@createPermohonan').then((interception) => {
            nomorPermohonan = interception.response.body.nomorPermohonan;
            idDcDataDasar = interception.response.body.idDcDataDasar;
            cy.log(`DATA DISIMPAN - NO: ${nomorPermohonan} | ID: ${idDcDataDasar}`);
        });

        cy.contains('button', 'OK').click();
    });

    // IT BLOCK 2: PROSES PENERIMAAN IJP
    // ============================================================
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