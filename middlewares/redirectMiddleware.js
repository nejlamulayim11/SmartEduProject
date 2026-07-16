export default (req, res, next) => {
    // 1. Çerez yerine Header'a (Authorization) bakıyoruz
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    }

    // 2. Eğer token varsa (yani kişi zaten giriş yapmışsa) onu anasayfaya veya dashboarda at
    if (token) {
        return res.redirect('/'); 
    }
    
    // 3. Token yoksa (giriş yapmamışsa) sayfayı görüntülemesine izin ver (login/register sayfası)
    next();
};