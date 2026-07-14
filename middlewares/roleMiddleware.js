/* Sistemi kullanan kullanıcının rolü,  bu fonksyonu kullandığımız 
yerden yollanan kullanıcı rolleri arasında değilse 401 yetkisi yok 
hata kodunu alırken. Aksi durumda işlem devam edecektir. 

If the role of the user using the system is not among the user 
roles sent from where we use this function, when getting the 401 
not authorized error code. Otherwise, the process will continue.
*/
export default (roles) => {
    return (req, res, next) => {
        const userRole = req.body.role;
        if (roles.includes(userRole)) {
            next();
        } else {
            return res.status(401).send("You Can't Do It");
        }
    };
};
