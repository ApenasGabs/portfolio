import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [userData, setUserData] = useState<any>()
const endPointUrl = 'https://api.github.com/users/apenasgabs/repos'
  useEffect(()=>{
    const fetchData = async () => {
      try {
        const result = await axios.get(endPointUrl)
        if (result.status === 200 ) {
        setUserData(result)}
      } catch (error) {
        
      }
    }
    fetchData()
  },[])
  return (
    <>
      {userData.map((repos: any)=> {
        return (<>
        <div>{repos.name}</div>
        <div>{repos}</div></>)
      })}
    </>
  )
}

export default App
