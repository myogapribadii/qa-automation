/// <reference types="cypress" />

describe('Test Dans Multi Pro', () => {

    afterEach(function () {
        if (this.currentTest.state === 'failed') {
            Cypress.runner.stop();
        }
    });

    beforeEach(() => {
        cy.fixture('urls').then((urls) => {
            cy.session('login-staff', () => {
                cy.visit(urls.loginDemo);
                cy.contains('Login').should('be.visible');
                cy.loginDemo('admin');
            });
        });
    });

    // ============================================================
    it('1. Tambah Karyawan', () => {

        cy.wait(5000); // Tunggu sejenak untuk memastikan semua elemen siap
        cy.contains('.oxd-text', 'Recruitment').click({ timeout: 50000 });
        cy.contains('.oxd-button ', ' Add ').click({ timeout: 50000 });
        cy.get('[name="firstName"]').type('Muhammad');
        cy.get('[name="middleName"]').type('Yoga');
        cy.get('[name="lastName"]').type('Pribadi');
        cy.get('[placeholder="Type here"]').eq(0).type('yoga@gmail.com');
        cy.get('[placeholder="Type here"]').eq(1).type('081234567890');
        cy.get('[placeholder="Type here"]').eq(2).type('ini ada Notes');
        cy.get('[placeholder="Enter comma seperated words..."]').eq(0).type('Jalan Jalan');
        cy.get('.oxd-checkbox-input-icon').click();
        cy.contains('.oxd-button ', ' Save ').click({ timeout: 50000 });
        cy.wait(7000); // Tunggu sejenak untuk memastikan data tersimpan dan muncul di daftar
        cy.get('.oxd-text--p').should('contain', 'Muhammad Yoga Pribadi').should('be.visible');

    });

});