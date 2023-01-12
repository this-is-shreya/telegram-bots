const app = require("express")() // For creating the server
const {Telegraf,session, Scenes:{Stage, WizardScene}} = require("telegraf") 
const dotenv = require("dotenv")  // For reading the .env file
dotenv.config({path:"./config.env"})  // For reading the .env file
const bot = new Telegraf(process.env.BOT_TOKEN)

const course = new WizardScene("choose course",
async(ctx)=>{
    ctx.reply(`Hey There! Choose your preferred domain`,
    {
        reply_markup:{
            inline_keyboard:[
                [
                    {
                        text:"Frontend",
                        callback_data:"Frontend"
                    },
                    {
                        text:"Backend",
                        callback_data:"Backend"
                    }
                ]
            ]
        }
    })
    ctx.wizard.cursor = 0
    return ctx.wizard.next()

},
async(ctx)=>{
    if(ctx.callbackQuery == undefined){
        ctx.reply("Incorrect input. Bot has left the chat")
        ctx.scene.leave()
    }
    else if(ctx.callbackQuery.data == "Backend"){
        ctx.answerCbQuery()
        ctx.wizard.state.domain = ctx.callbackQuery.data
        ctx.reply("What technologies do you prefer to work with?",{
            reply_markup:{
                inline_keyboard:[
                    [
                        {
                            text:"Node.js",
                            callback_data:"Node.js"
                        },
                        {
                            text:"Django",
                            callback_data:"Django"
                        }
                    ]
                ]
            }
        })
        ctx.wizard.cursor = 1

        return ctx.wizard.next()

    }
    else{
        ctx.answerCbQuery()

        ctx.wizard.state.domain = ctx.callbackQuery.data

        ctx.reply("What technologies do you prefer to work with?",{
            reply_markup:{
                inline_keyboard:[
                    [
                        {
                            text:"Basic HTML/CSS/JS",
                            callback_data:"HTML/CSS/JS"
                        },
                        {
                            text:"React",
                            callback_data:"React"
                        }
                    ]
                ]
            }
        })
        ctx.wizard.cursor = 1

        return ctx.wizard.next()
    }
},
async(ctx)=>{
    if(ctx.callbackQuery == undefined){
        ctx.reply("Incorrect input. Bot has left the chat")
        ctx.scene.leave()
    }
    else{
        ctx.answerCbQuery()

        ctx.wizard.state.tech = ctx.callbackQuery.data
        ctx.reply(`You have entered:
Preferred Domain: ${ctx.wizard.state.domain}
Preferred technologies: ${ctx.wizard.state.tech}

Do you want to change it?`,{
    reply_markup:{
        inline_keyboard:[
            [
                {
                    text:"Yes",
                    callback_data:"Yes"
                },
                {
                    text:"No",
                    callback_data:"No"
                }
            ]
        ]
    }
})
ctx.wizard.cursor = 2

return ctx.wizard.next()
    }
},
async(ctx)=>{
    if(ctx.callbackQuery == undefined){
        ctx.reply("Incorrect input. Bot has left the chat")
        ctx.scene.leave()
    }
    else if(ctx.callbackQuery.data == "No"){
        ctx.answerCbQuery()

        ctx.reply("Thank you for your response")
        ctx.scene.leave()
    }
    else{
        ctx.answerCbQuery()

        return ctx.wizard.steps[0](ctx)
    }
}
)
 

session({
    property: 'chatSession',
    getSessionKey: (ctx) => ctx.chat && ctx.chat.id,
})
bot.use(session());

const stage = new Stage([course],{sessionName:'chatSession'})
bot.use(stage.middleware())
stage.register(course)

bot.command("/addPreference",async(ctx)=>{
    ctx.scene.enter("choose course")
})



bot.launch()
app.listen(3000,()=>{
    console.log("listening at 3000")
})