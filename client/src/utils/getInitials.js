 export default function getInitials(username){

    if(!username) return "?"

    const words= username.trim().split(" ")

    let initials= ""


    words.forEach(word=>{
        initials+=word[0].toUpperCase()
    })
    return initials
}