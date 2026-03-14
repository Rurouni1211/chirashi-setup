import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MapView from "../components/MapView";

export default function MapShow(){

  const {ku} = useParams();

  return(

    <div style={{display:"flex"}}>

      <Sidebar/>

      <div style={{flex:1}}>

        <MapView highlight={ku} readonly />

      </div>

    </div>

  )

}