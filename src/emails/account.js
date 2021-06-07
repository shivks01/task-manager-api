const sgMail= require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'shivealt@gmail.com',
        subject:'Welcome',
        text:`Hi, ${name} Hope you enjoy our service.`
    })
}

const departEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'shivealt@gmail.com',
        subject:'GoodBye :(',
        text:`Goodbye,${name} .Please provide feedback,TY.`
    })
}
module.exports={
    sendWelcomeEmail,
    departEmail
}