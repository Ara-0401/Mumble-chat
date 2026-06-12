import {Routes,Route} from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Container from "./Layout/Container"
import RoomPanel from "./Components/RoomPanel"
import SearchPanel from "./Components/SearchPanel"
import Settings from "./Components/Settings"

function App(){
  return (
    <>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/container" element={<Container />}>
        <Route index element={<RoomPanel/>}/>
        <Route path="chat" element={<RoomPanel/>}/>
        <Route path="search" element={<SearchPanel/>}/>
        <Route path="settings" element={<Settings/>}/>
      </Route>
    </Routes>
    </>
   
  )
}

export default App;