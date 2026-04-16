describe('Admin Products E2E', () => {
    beforeEach(() => {
        // 1. Resetear BD y seed básico
        cy.request({
            method: 'POST',
            url: 'http://127.0.0.1:4000/api/test/reset-db',
            failOnStatusCode: false
        });

        cy.request({
            method: 'POST',
            url: 'http://127.0.0.1:4000/api/test/seed-products',
            failOnStatusCode: false
        });

        // 2. Registrar/Asegurar un usuario administrador
        cy.request({
            method: 'POST',
            url: 'http://127.0.0.1:4000/api/auth/register',
            body: {
                displayName: 'Admin Master',
                email: 'admin@test.com',
                password: 'Password123!',
                role: 'admin'
            },
            failOnStatusCode: false
        });

        // 3. Login por UI
        cy.visit('/login');
        cy.get('[data-cy="login-email"]').type('admin@test.com');
        cy.get('[data-cy="login-password"]').type('Password123!');
        cy.get('[data-cy="login-submit"]').click();

        // Esperar a que la autenticación sea procesada por el frontend
        cy.contains('Hola, Admin Master').should('be.visible');

        // 4. Ir de inmediato al panel de administración de productos
        cy.visit('/admin/products');
        
        // Esperar a que la tabla contenga al menos un producto (los seedeados) antes de continuar
        cy.get('.admin-table').should('be.visible');
    });

    it('Debe crear, editar y eliminar un producto', () => {
        const uniqueProduct = `Consola Test ${Date.now()}`;
        
        // ===== CREAR =====
        cy.get('[data-cy="admin-add-product-btn"]').click();
        
        // Llenar formulario (los Inputs requeridos por el backend y la validación)
        cy.get('input[name="name"]').type(uniqueProduct);
        cy.get('input[name="company"]').type('EmpresaTest');
        
        // Seleccionamos la primera categoría disponible por index
        cy.get('select[name="category"]').find('option').eq(1).then($option => {
            cy.get('select[name="category"]').select($option.val());
        });

        cy.get('input[name="price"]').type('9999');
        cy.get('input[name="stock"]').type('10');
        cy.get('input[name="region"]').type('NTSC-U');
        cy.get('select[name="condition"]').select('New');
        
        cy.get('input[name="includes"]').type('Consola, Cables');
        cy.get('textarea[name="description"]').type('Descripción corta para testing');
        cy.get('textarea[name="details"]').type('Especificaciones técnicas muy detalladas...');

        // Guardar producto
        cy.get('[data-cy="submit-product-btn"]').click();

        // Verificar que el modal/form desaparece y el producto está en la lista principal
        cy.get('form.admin-product-form').should('not.exist');
        cy.get('[data-cy="product-name"]').should('contain', uniqueProduct);


        // ===== EDITAR =====
        const updatedName = `${uniqueProduct} V2`;
        
        // Buscar la fila específica de nuestro producto recién creado
        cy.get('[data-cy="product-row"]').contains(uniqueProduct).parents('tr').within(() => {
            cy.get('[data-cy="edit-product-btn"]').click();
        });

        // Modificar valores (debe limpiarse primero el campo principal a editar)
        cy.get('input[name="name"]').clear().type(updatedName);
        cy.get('input[name="price"]').clear().type('8888');

        // Guardar
        cy.get('[data-cy="submit-product-btn"]').click();

        // Verificamos modal cerrado y nombres nuevos reflejados en UI
        cy.get('form.admin-product-form').should('not.exist');
        cy.get('[data-cy="product-name"]').should('contain', updatedName);
        cy.get('[data-cy="product-row"]').contains(updatedName).parents('tr').should('contain', '$8888');

        // ===== ELIMINAR =====
        // Cypress auto-acepta los window.confirm a menos que se indique lo contrario
        cy.get('[data-cy="product-row"]').contains(updatedName).parents('tr').within(() => {
            cy.get('[data-cy="delete-product-btn"]').click();
        });

        // Verificamos que ya no esté en la tabla
        // Le damos un pequeño tiempo a que el servidor borre y la UI refresque
        cy.get('[data-cy="product-name"]').should('not.contain', updatedName);
    });
});
