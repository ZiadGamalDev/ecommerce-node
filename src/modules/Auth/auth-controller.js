import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../../../DB/models/user-model.js";
import sendEmailService from "../../services/send-email.js";

// ========================================= SignUp API ================================//

export const signUp = async (req, res, next) => {
  // 1- destructure the required data from the request body
  const { username, email, password, age, role, phoneNumbers, addresses } =
    req.body;

  // 2- check if the user already exists in the database using the email
  const isEmailDuplicated = await User.findOne({ email });
  if (isEmailDuplicated) {
    return next(
      new Error("Email already exists,Please try another email", { cause: 409 })
    );
  }
  // 3- send confirmation email to the user
  const usertoken = jwt.sign({ email }, process.env.JWT_SECRET_VERFICATION, {
    expiresIn: "30m",
  });

  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Email Verification",
    message: `
        <h2>please click on this link to verfiy your email</h2>
        <a href="${req.protocol}://${req.headers.host}/auth/verify-email?token=${usertoken}">Verify Email</a>
        `,
  });
  // 4- check if email is sent successfully
  if (!isEmailSent) {
    return next(
      new Error("Failed to send verification email ", { cause: 500 })
    );
  }
  // 5- password hashing
  const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);

  // 6- create new document in the database
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    age,
    role,
    phoneNumbers,
    addresses,
    test: req.body.test,
  });

  // 7- return the response
  res.status(201).json({
    success: true,
    message:
      "User created successfully, please check your email to verify your account",
    data: newUser,
  });
};

// ========================================= Verify Email API ================================//

export const verifyEmail = async (req, res, next) => {
  const { token } = req.query;
  const decodedData = jwt.verify(token, process.env.JWT_SECRET_VERFICATION);
  // get uset by email , isEmailVerified = false
  const user = await User.findOneAndUpdate(
    {
      email: decodedData.email,
      isEmailVerified: false,
    },
    { isEmailVerified: true },
    { new: true }
  );
  if (!user) {
    return next(new Error("Invalid Email", { cause: 404 }));
  }

  res.status(200).json({
    success: true,
    message: "Email verified successfully, please try to login",
  });
};

// ========================================= SignIn API ================================//

export const logIn = async (req, res, next) => {
  const { email, password } = req.body;
  // get user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("Invalid login credentials", { cause: 404 }));
  }
  // check if email is verified
  if (!user.isEmailVerified) {
    return next(new Error("Please verify your email first", { cause: 400 }));
  }
  // check password
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return next(new Error("Invalid login credentials", { cause: 404 }));
  }

  // generate login token
  const token = jwt.sign(
    { email, id: user._id, loggedIn: true },
    process.env.JWT_SECRET_LOGIN,
    { expiresIn: "1d" }
  );
  // updated isLoggedIn = true  in database

  user.isLoggedIn = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: {
      token,
    },
  });
};

//============================================= Forget password

export const forgetPassword = async (req, res, next) => {
  //destructing user email from body
  const { email } = req.body;

  const notFoundError = new Error(
    "If email exists, reset instructions will be sent"
  );
  // check user email & isEmailVerified
  const user = await User.findOne({ email, isEmailVerified: true });
  if (!user) {
    console.log(`Reset password attempted for non-existent email: ${email}`);
    return res.status(200).json({ message: notFoundError.message });
  }

  // generte user token

  const userToken = jwt.sign(
    { email, userId: user._id },
    process.env.JWT_SECRET_FORGET_PASS,
    {
      expiresIn: "30m",
    }
  );

  //store token in db

  const tokenHash = crypto.createHash("sha256").update(userToken).digest("hex");
  user.passwordResetToken = tokenHash;
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  // send Email

  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Password Reset Request",
    message: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${req.protocol}://${req.headers.host}/auth/reset-password?token=${userToken}"> Reset Password</a>
        
      <p>This link will expire in 30 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>For security, this link can only be used once.</p>
    `,
  });
  // 4- check if email is sent successfully
  if (!isEmailSent) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return next(new Error("Failed to send reset email", { cause: 500 }));
  }

  res.status(200).json({
    success: true,
    message: "If email exists, reset instructions will be sent",
  });
};

//================================================== Reset Password===============================

export const resetPassword = async (req, res, next) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  // Validate input
  if (!token || !newPassword) {
    return next(new Error("Missing required fields", { cause: 400 }));
  }

  const decodedUser = jwt.verify(token, process.env.JWT_SECRET_FORGET_PASS);

  console.log(decodedUser);

  // Find user
  const user = await User.findOne({ email: decodedUser.email });
  if (!user) {
    return next(new Error("Invalid reset request", { cause: 400 }));
  }

  // Check if reset is allowed
  if (!user.passwordResetToken || !user.passwordResetExpires) {
    return next(new Error("No reset request found", { cause: 400 }));
  }

  // Validate token
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  if (user.passwordResetToken !== tokenHash) {
    return next(new Error("Invalid reset token", { cause: 400 }));
  }

  // Check token expiration
  if (user.passwordResetExpires < Date.now()) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return next(new Error("Reset token has expired", { cause: 400 }));
  }

  // Hash new password
  const hashedPassword = bcrypt.hashSync(newPassword, +process.env.SALT_ROUNDS);

  // Update user
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();

  await user.save();

  await sendEmailService({
    to: decodedUser.email,
    subject: "Password Reset Successfully",
    message:
      "Your password has been successfully reset. If you didn't make this change, please contact support immediately.",
  });

  return res.status(200).json({
    success: true,
    message: "Password has been reset successfully",
  });
};

// export const loginWithGmail = async (req, res, next) => {
//     // req.body.idToken
//     const { idToken } = req.body

//     const client = new OAuth2Client();

//     async function verify() {
//     const ticket = await client.verifyIdToken({
//         idToken,
//         audience: process.env.CLIENT_1_ID,  // Specify the CLIENT_ID of the app that accesses the backend
//         // Or, if multiple clients access the backend:
//         //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
//     });
//     const payload = ticket.getPayload();
//     return payload
//     }

//     const result = await verify().catch(console.error);

//     if(!result.email_verified) return next(new Error('Email not verified, please enter another google email', { cause: 400 }))

//     // get user by email
//     const user = await User.findOne({ email:result.email , provider:'GOOGLE'})
//     if (!user) {
//         return next(new Error('Invalid login credentails', { cause: 404 }))
//     }
//     // generate login token
//     const token = jwt.sign({
//         email:result.email ,  id: user._id, loggedIn: true },
//             process.env.JWT_SECRET_LOGIN,
//             { expiresIn: '1d' })

//     // updated isLoggedIn = true  in database
//     user.isLoggedIn = true
//     await user.save()

//     res.status(200).json({
//         success: true,
//         message: 'User logged in successfully',
//         data: {
//             token
//         }
//     })
// }

// export const signUpWithGmail = async (req, res, next) => {
//     const { idToken } = req.body

//     const client = new OAuth2Client();

//     async function verify() {
//     const ticket = await client.verifyIdToken({
//         idToken,
//         audience: process.env.CLIENT_1_ID,  // Specify the CLIENT_ID of the app that accesses the backend
//         // Or, if multiple clients access the backend:
//         //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
//     });
//     const payload = ticket.getPayload();
//     return payload
//     }

//     const result = await verify().catch(console.error);

//     if(!result.email_verified) return next(new Error('Email not verified, please enter another google email', { cause: 400 }))

//     // 2- check if the user already exists in the database using the email
//     const isEmailDuplicated = await User.findOne({ email:result.email })
//     if (isEmailDuplicated) {
//         return next(new Error('Email already exists,Please try another email', { cause: 409 }))
//     }

//     // 5- password hashing
//     const randomPassword = Math.random().toString(36).slice(-8);
//     const hashedPassword = bcrypt.hashSync(randomPassword, +process.env.SALT_ROUNDS)

//     // 6- create new document in the database
//     const newUser = await User.create({
//         username:result.name,
//         email:result.email,
//         password: hashedPassword,
//         isEmailVerified:true,
//         provider:'GOOGLE'
//     })

//     // 7- return the response
//     res.status(201).json({
//         success: true,
//         message: 'User created successfully, please login and complete your profile',
//         data: newUser
//     })
// }

export const logout = async (req, res, next) => {
  const { user } = req;
  user.isLoggedIn = false;
  await user.save();
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};