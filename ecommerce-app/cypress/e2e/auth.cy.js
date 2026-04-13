describe('Autenticación - Retro-Bits E2E', () => {
    // Generamos un usuario único para esta corrida de tests
    const timestamp = Date.now();
    const testUser = {
        name: 'QA Tester ' + timestamp,
        email: `tester_${timestamp}@retrobits.com`,
        password: 'Password123!'
    };

    // Antes de todos los tests en este archivo, reseteamos la base de datos de pruebas
    before(() => {
        // Llamamos al endpoint de utilidad para limpiar la DB de pruebas
        cy.request('POST', 'http://127.0.0.1:4000/api/test/reset-db').then((response) => {
            expect(response.status).to.eq(200);
            cy.log('Base de datos de pruebas reseteada correctamente');
        });
    });

    beforeEach(() => {
        cy.visit('/');
    });

    it('debe completar el flujo completo: Registro -> Login -> Identificación', () => {
        // 1. Ir a Registro
        cy.visit('/register');
        cy.get('h2').should('contain', 'Registrar usuario');

        // 2. Llenar Formulario de Registro
        cy.get('[data-cy="register-name"]').type(testUser.name);
        cy.get('[data-cy="register-email"]').type(testUser.email);
        cy.get('[data-cy="register-password"]').type(testUser.password);
        cy.get('[data-cy="register-verify-password"]').type(testUser.password);

        // 3. Enviar Registro
        cy.get('[data-cy="register-submit"]').click();

        // 4. Verificar Redirección y Mensaje
        cy.url().should('include', '/login');
        cy.contains('Registro exitoso').should('be.visible');

        // 5. Llenar Formulario de Login
        cy.get('[data-cy="login-email"]').type(testUser.email);
        cy.get('[data-cy="login-password"]').type(testUser.password);

        // 6. Enviar Login
        cy.get('[data-cy="login-submit"]').click();

        // 7. Verificar Login Exitoso (Redirección a Home)
        cy.url().should('eq', Cypress.config().baseUrl + '/');
        
        // 8. Verificar que el Header muestre el nombre del usuario
        // Buscamos el texto "Hola, [Nombre]" que es el patrón en Header.jsx
        cy.contains(`Hola, ${testUser.name}`).should('be.visible');
    });

    it('debe fallar el login con credenciales incorrectas', () => {
        cy.visit('/login');

        cy.get('[data-cy="login-email"]').type(testUser.email);
        cy.get('[data-cy="login-password"]').type('WrongPassword!!!');

        cy.get('[data-cy="login-submit"]').click();

        // Debería mostrar el mensaje modificado por el frontend en AuthContext ("Credenciales inválidas")
        cy.contains('Credenciales inválidas').should('be.visible');
    });
});
