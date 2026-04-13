describe('Gestión de Carrito - E2E', () => {
    before(() => {
        // Asegurar que la base de datos de pruebas tenga productos
        cy.request('POST', 'http://127.0.0.1:4000/api/test/seed-products').then((response) => {
            expect(response.status).to.eq(200);
            cy.log('Base de datos de pruebas tiene productos disponibles.');
        });
    });

    beforeEach(() => {
        // Limpiamos el localStorage para asegurar que empezamos con un carrito vacío
        // (Retro-bits persiste el carrito de usuarios no logueados en localStorage)
        cy.clearLocalStorage();
        cy.visit('/');
    });

    it('Debe agregar productos, modificar cantidades y eliminar del carrito', () => {
        // 1. Aseguramos que haya al menos un producto renderizado en el Home
        cy.get('[data-cy="add-to-cart-btn"]').should('have.length.greaterThan', 0);
        
        // 2. Agregamos el primer producto al carrito
        cy.get('[data-cy="add-to-cart-btn"]').first().click();
        
        // 3. Navegamos al carrito
        cy.get('[data-cy="nav-cart-btn"]').click();
        cy.url().should('include', '/cart');

        // 4. Verificamos que se haya agregado (cantidad inicial: 1)
        cy.get('[data-cy="cart-item-qty"]').should('contain.text', '1');

        // 5. Adición de más productos desde la vista del carrito (Botón +)
        cy.get('[data-cy="increase-qty-btn"]').first().click();
        cy.get('[data-cy="cart-item-qty"]').should('contain.text', '2');

        // 6. Volvemos al Home y agregamos el MISMO producto desde el Home
        cy.visit('/');
        cy.get('[data-cy="add-to-cart-btn"]').first().click(); 
        
        // 7. Volvemos al carrito para verificar que la cantidad sume 3
        cy.get('[data-cy="nav-cart-btn"]').click();
        cy.get('[data-cy="cart-item-qty"]').should('contain.text', '3');

        // 8. Reducción de productos en el carrito (Botón -)
        cy.get('[data-cy="decrease-qty-btn"]').first().click();
        cy.get('[data-cy="cart-item-qty"]').should('contain.text', '2');

        // 9. Eliminación del producto del carrito
        cy.get('[data-cy="remove-item-btn"]').first().click();
        
        // 10. Verificamos que el carrito quede totalmente vacío
        cy.contains('Tu carrito está vacío').should('be.visible');
    });
});
