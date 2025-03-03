# User Registration Endpoint

## Endpoint

`POST /users/register`

## Description

This endpoint allows a new user to register by providing their first name, last name, email, and password. The backend validates the input, hashes the password, creates a new user in the database, and returns an authentication token.

## Data Flow

1. **Route Definition**: The route is defined in `routes/user.routes.js`.

   ```javascript
   // ...existing code...
   router.post(
     "/register",
     [
       body("email").isEmail().withMessage("Please enter a valid email"),
       body("fullname.firstname")
         .isLength({ min: 3 })
         .withMessage("First name must be at least 3 characters long"),
       body("password")
         .isLength({ min: 6 })
         .withMessage("Password must be at least 6 characters long"),
     ],
     userController.registerUser
   );
   // ...existing code...
   ```

2. **Controller**: The request is handled by the `registerUser` method in `controllers/user.controller.js`.

   ```javascript
   // ...existing code...
   module.exports.registerUser = async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
     try {
       const { fullname, email, password } = req.body;
       const hashPassword = await UserModel.hashPassword(password);

       const user = await userService.createUser({
         firstname: fullname.firstname,
         lastname: fullname.lastname,
         email,
         password: hashPassword,
       });

       const token = await user.generateAuthToken();

       res.status(200).json({ token, user });
     } catch (error) {
       console.log(error);
       res.status(500).json({ error: error.message });
     }
   };
   // ...existing code...
   ```

3. **Service**: The `createUser` method in `services/user.service.js` is called to create a new user.

   ```javascript
   // ...existing code...
   module.exports.createUser = async ({
     firstname,
     lastname,
     email,
     password,
   }) => {
     if (!firstname || !email || !password) {
       throw new Error("All fields are required");
     }
     const user = await UserModel.create({
       fullname: {
         firstname,
         lastname,
       },
       email,
       password,
     });
     return user;
   };
   // ...existing code...
   ```

4. **Model**: The `UserModel` in `models/user.model.js` defines the user schema and methods.

   ```javascript
   // ...existing code...
   const userSchema = new mongoose.Schema({
     fullname: {
       firstname: {
         type: String,
         required: true,
         minlength: [3, "First name must be at least 3 characters long"],
         maxlength: 50,
       },
       lastname: {
         type: String,
         required: false,
         minlength: [3, "Last name must be at least 3 characters long"],
         maxlength: 50,
       },
     },
     email: {
       type: String,
       required: true,
       unique: true,
       lowercase: true,
       match: [
         /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
         "Please fill a valid email address",
       ],
     },
     password: {
       type: String,
       required: true,
       minlength: [8, "Password must be at least 8 characters long"],
     },
     socketId: {
       type: String,
       required: false,
     },
   });

   userSchema.methods.generateAuthToken = function () {
     const token = jwt.sign(
       { _id: this._id, email: this.email },
       process.env.JWT_SECRET,
       {
         expiresIn: "7d",
       }
     );
     return token;
   };

   userSchema.methods.comparePassword = async function (candidatePassword) {
     return await bcrypt.compare(candidatePassword, this.password);
   };

   userSchema.statics.hashPassword = async function (password) {
     return await bcrypt.hash(password, saltRounds);
   };

   const UserModel = mongoose.model("user", userSchema);

   module.exports = UserModel;
   // ...existing code...
   ```
