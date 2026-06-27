import {
  createReservation
} from "./restaurantStorageService";



export const submitReservation = async (data) => {

  const reservation =
    await createReservation(data);


  return {
    success:true,
    confirmationId:
    `KS-${reservation.id}`
  };

};



export const submitContactForm = async(data)=>{


 console.log(
  "Contact submitted",
  data
 );


 return {
  success:true
 };

};