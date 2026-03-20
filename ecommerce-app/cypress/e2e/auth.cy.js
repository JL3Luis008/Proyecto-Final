describe('Autenticación - Retro-Bits', () => {
    const timestamp = Date.now();
    const testUser = {
        name: 'Cypress Test User',
        email: `test_${timestamp}@example.com`,
        password: 'Password123!'
    };

    beforeEach(() => {
        cy.visit('/');
    });

    it('debe registrar un nuevo usuario exitosamente', () => {
        cy.visit('/register');

        cy.get('[data-cy="register-name"]').type(testUser.name);
        cy.get('[data-cy="register-email"]').type(testUser.email);
        cy.get('[data-cy="register-password"]').type(testUser.password);
        cy.get('[data-cy="register-verify-password"]').type(testUser.password);

        cy.get('[data-cy="register-submit"]').click();

        // Debería redirigir al login
        cy.url().should('include', '/login');
        cy.contains('Registro exitoso').should('be.visible');
    });

    it('debe iniciar sesión con el usuario recién creado', () => {
        cy.visit('/login');

        cy.get('[data-cy="login-email"]').type(testUser.email);
        cy.get('[data-cy="login-password"]').type(testUser.password);

        cy.get('[data-cy="login-submit"]').click();

        // Debería redirigir a la home o perfil y mostrar datos del usuario
        cy.url().should('eq', Cypress.config().baseUrl + '/');
        // Asumiendo que hay un elemento que muestra el nombre del usuario logueado o un link a Profile
        cy.get('nav').should('contain', 'Cypress Test User');
    });

    it('debe mostrar error con credenciales inválidas', () => {
        cy.visit('/login');

        cy.get('[data-cy="login-email"]').type('email_no_existente@error.com');
        cy.get('[data-cy="login-password"]').type('wrongpassword');

        cy.get('[data-cy="login-submit"]').click();

        cy.contains('error').should('be.visible');
    });
});
