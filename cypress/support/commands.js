// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', () => {
// });
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


// Custom command untuk login berdasarkan peran/user
Cypress.Commands.add('loginAs', (role) => {
    cy.fixture('users').then(users => {
        const user = users[role]

        if (!user) {
            throw new Error(`Role "${role}" tidak ditemukan`)
        }

        cy.get('input[aria-label="username"]').type(user.email)
        cy.get('input[aria-label="password"]').type(user.password, { log: false })
        cy.contains('Login').click()

        cy.url().then((currentUrl) => {
            // Tentukan angka OTP berdasarkan URL
            const otpCode = currentUrl.includes('60.41') ? '012345' : '123456';

            // Masukkan OTP (Cukup tulis sekali, angkanya dinamis)
            cy.get('input[aria-label="Input OTP"]').type(otpCode)
            cy.contains('button', 'Submit').click()
        })
    })
})

// Perintah untuk Logout Dinamis (berdasarkan email user di profil)
Cypress.Commands.add('logoutAs', (role) => {
    cy.fixture('users').then((users) => {
        const userEmail = users[role].email;

        // Klik profil (mengatasi masalah opacity: 0)
        cy.contains('.block', userEmail)
            .should('be.visible')
            .click({ force: true });

        // Pilih Logout dari menu dropdown terbaru
        cy.get('.q-menu:visible', { timeout: 10000 })
            .last()
            .contains('.q-item', 'Logout', { matchCase: false })
            .click({ force: true });

        cy.contains('.block', "Keluar")
            .should('be.visible')
            .click({ force: true });

        cy.url().should('include', '/login');
    });
});

// Command untuk Input/Textarea Quasar
Cypress.Commands.add('safeType', (label, value) => {
    cy.get(`[aria-label="${label}"]`)
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .clear({ force: true })
        .type(value, { delay: 30, force: true })
        .should('have.value', value);
});

// Command untuk Dropdown Select Quasar
Cypress.Commands.add('selectQ', (label, value) => {
    cy.get(`input[aria-label="${label}"]`).click({ force: true });
    cy.get('.q-menu:visible', { timeout: 10000 }).should('be.visible');
    cy.contains('.q-menu:visible .q-item', value, { timeout: 10000 }).click({ force: true });
});

// Command untuk Upload File di Tabel Verifikasi
Cypress.Commands.add('uploadDoc', (label, fileName) => {
    const filePath = `cypress/fixtures/${fileName}`;
    cy.intercept('POST', '**/upload-dokumen**').as('uploading');

    cy.contains('td.nama-dokumen', label)
        .parent('tr')
        .find('input[type="file"]')
        .selectFile(filePath, { force: true });

    cy.wait('@uploading');
});

// Command untuk Upload File PBK/Dukcapil
Cypress.Commands.add('uploadPBK', (label, fileName) => {
    const filePath = `cypress/fixtures/${fileName}`;
    cy.contains('.q-field__label', label)
        .closest('.q-field__inner')
        .find('input[type="file"]')
        .selectFile(filePath, { force: true });

    cy.contains(label).closest('.q-field').should('contain', fileName);
});