//routes index!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
module.exports = {
    getHomePage: (req, res) => {
        let query = "SELECT * FROM `Proctors` ORDER BY id ASC"; // query database to get all the Proctors

        // execute query
        connection.query(query, (err, result) => {
            if (err) {
                res.redirect('/');
            }
            res.render('index.ejs', {
                title: 'Welcome to OOMPH | View Proctors'
                ,proctors: result
            });
        });
    },
};
