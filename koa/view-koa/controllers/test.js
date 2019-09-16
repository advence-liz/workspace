// index:

module.exports = {
    'GET /test': async (ctx, next) => {
        ctx.render('index.html', {
            title: 'Test'
        });
    }
};
