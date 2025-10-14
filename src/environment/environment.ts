export const environment = {
  production: true, // Change to true to activate production environment
  apiUrlDev: 'http://localhost:8071/api',
  apiUrlProd:'https://sol-solution-qrcode-production.up.railway.app/api'
};
if (environment.production) {
  console.log("✅ Environment de Prduction chargé !");
}else{
  console.log("✅ Environment de Développement chargé !");
}