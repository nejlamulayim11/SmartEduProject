export default (roles) => {
    return (req, res, next) => {
        // Kullanıcı giriş yapmış mı ve rolü var mı kontrol et
        const userRole = res.locals.userIN ? res.locals.userIN.role : null;
        
        // Kullanıcının rolü, izin verilen roller listesinde (roles) var mı?
        if (roles.includes(userRole)) {
            next(); // Yetkisi var, işlemi yapmasına izin ver
        } else {
            // Yetkisi yoksa 401 hatası ver (İstersen burayı res.redirect('/') yapabilirsin)
            return res.status(401).send('BU İŞLEMİ YAPMAYA VEYA SAYFAYI GÖRÜNTÜLEMEYE YETKİNİZ YOK');
        }
    };
};