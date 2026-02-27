import { http } from "./http";

//const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}products`;

// export const getProducts = async ()=>{
//     // User.findOne({name}).then(user=>{
//     //   Orders.find({userId:user.id}).then(orders=>{
//     //   })
//     // })

//     // try {
//     //   const user = await User.findOne({name});

//     //   const orders = await Orders.find({userId: user.id})
//     // } catch (error) {
      
//     // }

//     try {


//         const response = await fetch(BASE_URL);
//         if (!response.ok) {
//             console.log('error al hacer la petición');
//             throw new Error('');
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.log(error);
//         throw new Error(error);
//     }
//     finally{

//     }
// }

export const getProducts = async (page, limit) => {
  try {
    const response = await http.get("products", { params: { page, limit } });
    const data = response.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getProductById = async (id) => {
  try {
    const response = await http.get(`products/${id}`);
    const data = response.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};
