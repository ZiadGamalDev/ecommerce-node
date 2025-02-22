import { customAlphabet } from "nanoid";


   const generateUniqurString=(length)=>{



    const nanoid= customAlphabet('1234567asdfrgt',length||13)
return nanoid() // function
 }
 export default generateUniqurString;