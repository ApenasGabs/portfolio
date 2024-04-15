import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { ReposProps } from "./types";

function App() {
  const [userData, setUserData] = useState<ReposProps[]>();
  const endPointUrl = "https://api.github.com/users/apenasgabs/repos";
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(endPointUrl);
        if (result.status === 200) {
          setUserData(result.data);
        }
      } catch (error) {
        console.log(error)
      }
    };
    fetchData();
  }, []);
  return (
    <>
      {userData&&
      userData.map((repo) => {
        console.log('repo: ', repo);
        return (
          <>
            <div>{repo.name}</div>
            <div>{repo.language}</div>
          </>
        );
      })}
    </>
  );
}

export default App;
