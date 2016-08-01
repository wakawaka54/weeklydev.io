const prod = process.env.NODE_ENV === 'production';
const JWT_SECRET_DEFAULT = 'MememememmememexkådkksokfopsekfskfdfpkapkdapwkdpakdpokpokkkKPOKPOKPKkPOkPkpkPkpkPOkPOkPkPkkpkpkpKpOKpOKPOKPkPokPkpKpkPkppkmememems';
const SUPPLIED_JWT_SECRET = process.env.JWT_SECRET;

const MONGO_URL_DEFAULT = 'mongodb://localhost:27017/WOIP-backend';
const SUPPLIED_MONGO_URL = process.env.MONGO_URL;

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

function getJWTSecret () {
  if (!SUPPLIED_JWT_SECRET) {
    console.error('WARNING: Undefined $JWT_SECRET. Using default.');
    return JWT_SECRET_DEFAULT;
  }

  return SUPPLIED_JWT_SECRET;
}

function getMongoUrl () {
  if (!SUPPLIED_MONGO_URL) {
    console.error('WARNING: Undefined $MONGO_URL. Using default');
    return MONGO_URL_DEFAULT;
  }

  return SUPPLIED_MONGO_URL;
}

export const MONGO_URL = getMongoUrl();
export const JWT_SECRET = getJWTSecret();
export const PORT = process.env.PORT || 1337;
export const HOST = prod ? 'weeklydev.io' : 'localhost';

export const cookie_options = {
  ttl: 365 * 24 * 60 * 60 * 1000, // expires a year from today 
  encoding: 'none', // we already used JWT to encode 
  isSecure: prod, // warm & fuzzy feelings 
  isHttpOnly: false, // prevent client alteration 
  clearInvalid: true, // remove invalid cookies 
  strictHeader: false, // don't allow violations of RFC 6265
  path: '/'

};

export const emailConfig = {
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
};
