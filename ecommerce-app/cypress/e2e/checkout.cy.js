describe('Flujo de Compra Completo - E2E', () => {
    before(() => {
        // Reset DB y Seed Products para asegurar el testing env limpio
        cy.request('POST', 'http://127.0.0.1:4000/api/test/reset-db').then((res) => {
            expect(res.status).to.eq(200);
        });
        cy.request('POST', 'http://127.0.0.1:4000/api/test/seed-products').then((res) => {
            expect(res.status).to.eq(200);
        });

        // Registrar usuario falso bajo la mesa
        cy.request({
            method: 'POST',
            url: 'http://127.0.0.1:4000/api/auth/register',
            body: {
                displayName: "QA Tester",
                email: "checkout@test.com",
                password: "Password123!",
                role: "customer"
            },
            failOnStatusCode: false // por si ya existe de runs previos
        });
    });

    beforeEach(() => {
        // Log in to API y set localStorage tokens antes de visitar
        cy.clearLocalStorage();
        cy.request('POST', 'http://127.0.0.1:4000/api/auth/login', {
            email: "checkout@test.com",
            password: "Password123!"
        }).then((res) => {
            const token = res.body.token;
            const refreshToken = res.body.refreshToken;
            
            // Setear el token de login para la sesion del navegador
            window.localStorage.setItem('authToken', token);
            window.localStorage.setItem('refreshToken', refreshToken);
        });
    });

    it('Agrega producto, procede a checkout, llena datos de envio, método de pago y finaliza compra', () => {
        // 1. Visit Home (Interceptando la carga inicial)
        cy.visit('/');

        // 2. Click al primer botón de add to cart
        cy.get('[data-cy="add-to-cart-btn"]').first().click();

        // Esperar a que el contador del carrito se actualice a 1
        cy.get('[data-cy="cart-badge"]').should('have.text', '1');

        // 3. Ir al carrito mediante header de navegación
        cy.get('[data-cy="nav-cart-btn"]').click();
        cy.url().should('include', '/cart');

        // 4. Hacer clic en "Proceder al Pago"
        cy.get('[data-cy="checkout-btn"]').click();
        
        // 5. Validar que estamos en la UI Checkout
        cy.url().should('include', '/checkout');

        // ==== DIRECCION DE ENVIO ====
        cy.get('[data-cy="address-add-btn"]').click();
        
        // Llenar datos de direccion
        cy.get('input[name="name"]').type('QA Tester');
        cy.get('input[name="address1"]').type('Calle Testing Cypress 123');
        cy.get('input[name="city"]').type('Silicon Valley');
        cy.get('input[name="state"]').type('California');
        cy.get('input[name="postalCode"]').type('54321');
        cy.get('input[name="country"]').type('Mexico');
        cy.get('input[name="phone"]').type('5551234567');

        // Enviar formulario (Botón submit de la dirección)
        cy.get('.address-form button[type="submit"]').click();

        // Esperar guardado: Debe aparecer el nombre de nuestra dirección agregada
        cy.contains('Calle Testing Cypress 123');


        // ==== METODO DE PAGO ====
        cy.get('[data-cy="payment-add-btn"]').click();

        // Llenar tarjeta
        cy.get('input[name="bankName"]').type('Tarjeta Cypress');
        cy.get('input[name="cardNumber"]').type('4111111111111111');
        cy.get('input[name="placeHolder"]').type('QA Cypress Tester');
        cy.get('input[name="expiryDate"]').type('12/28');
        cy.get('input[name="cvv"]').type('321');

        // Enviar formulario (Botón submit de pago)
        cy.get('.payment-form button[type="submit"]').click();

        // Esperar a que el formulario se cierre (desaparezca de la UI)
        cy.get('.payment-form').should('not.exist');

        // Confirmar que el alias aparece en la lista o en el resumen seleccionado
        cy.get('body').should('contain', 'Tarjeta Cypress');
        cy.get('[data-cy="selected-payment-alias"]').should('contain', 'Tarjeta Cypress');


        // ==== CONFIRMAR Y PAGAR ====
        cy.get('[data-cy="confirm-pay-btn"]').click();

        // 6. Afirmación Final de Exito
        cy.url().should('include', '/order-confirmation');
        cy.contains('¡Gracias por tu compra!');
    });
});
