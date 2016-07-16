const JWT_SECRET_DEFAULT = 'MememememmememexkådkksokfopsekfskfdfpkapkdapwkdpakdpokpokkkKPOKPOKPKkPOkPkpkPkpkPOkPOkPkPkkpkpkpKpOKpOKPOKPkPokPkpKpkPkppkmememems';
const SUPPLIED_JWT_SECRET = process.env.JWT_SECRET;

const MONGO_URL_DEFAULT = 'mongodb://localhost:27017/WOIP-backend'
const SUPPLIED_MONGO_URL = process.env.MONGO_URL;

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
