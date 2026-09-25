# Backend validation patch

The ZIP is the Angular project. The Node/Express backend was supplied separately as pasted code, so this folder contains the exact backend validation contract to apply there.

## Shared Signup contract
- Full name: `^[a-zA-Z]{3,15}( [a-zA-Z]{3,15}){1,3}$`
- Email: `^[a-zA-Z0-9._%+-]+@gmail\.com$`
- Egyptian phone: `^(01)(1|2|0|5)[0-9]{8}$`
- Password: `^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@%$&*^#])[a-zA-Z0-9@%$&*^#]{8,}$`
- OTP: exactly 6 digits

Enforce the raw-password regex in express-validator before hashing. Keep only normal storage constraints on the hashed password field in Mongoose.

Add the validators to the auth/user routes before controllers. The Angular interceptor logs every HTTP request, response and error in the browser console, with password/OTP/token values redacted.
