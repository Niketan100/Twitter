import jwt from 'jsonwebtoken';

export const genrateTokenAndSetcookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET_KEY,{
        expiresIn: '14d'
    })

    res.cookie("jwt", token,{
        httpOnly: true,
        sameSite : "strict",
        
    })
    console.log(res.cookie())
}