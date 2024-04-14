import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [userData, setUserData] = useState<any>()
const endPointUrl = 'https://api.github.com/users/apenasgabs/repos'
  useEffect(()=>{
    const fetchData = async () => {
      try {
        const result = await axios.get(endPointUrl)
        setUserData(result)
      } catch (error) {
        
      }
    }
    fetchData()
  },[])
  return (
    <>
      {userData.map((repos: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined)=> {
        return <div>{repos}</div>
      })}
    </>
  )
}

export default App
