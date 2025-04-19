import React, { useEffect, useState } from "react";
// import { Calendar } from "@/components/ui/calendar";
import Calendar from "../components/cal";
import Navbar from "@/components/navbar";
import axios from "axios";

export default function Dashboard() {
  // const [showNavbar, setShowNavbar] = useState(false);
  // const navigate= useNavigate();
  // const handleCreateTask=()=>{
  //     // setShowNavbar((prevShowNavbar) => !prevShowNavbar);
  //     navigate('/createtask')
  // }

  async function fetchEventsData() {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/case/events",
        {
          withCredentials: true,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data; // User's Microsoft Graph profile data
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }

  async function fetchUserData() {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/user/me",
        {
          withCredentials: true,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response; // User's Microsoft Graph profile data
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }

  const [eventsData, setEventsData] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function loadEventsData() {
      try {
        const data = await fetchEventsData();
        setEventsData(data);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    }
    async function loadUserData() {
      try {
        const data = await fetchUserData();
        setUserData(data.data);
        console.log(userData, "userData");
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    }
    loadEventsData();
    loadUserData();
  }, []);

  return (
    <div className="overflow-hidden pr-9 rounded-md bg-custom-dark-indigo max-md:pr-5">
      <div className="flex gap-5 max-md:flex-col">
        <div className="flex flex-col w-[14%] max-md:ml-0 max-md:w-full">
          <Navbar />
        </div>
        <div className="flex flex-col ml-5 w-[84%] max-md:ml-0 max-md:w-full">
          <div className="flex flex-col w-full max-md:mt-10 max-md:max-w-full">
            <div className="flex flex-wrap gap-5 justify-between w-full font-semibold text-white max-md:max-w-full">
              {/* <div className="my-auto text-2xl">Dashboard</div> */}
              {/* <div className="flex gap-8 items-center px-4 py-3.5 text-sm rounded-lg bg-custom-light-indigo">
                <div className="self-stretch my-auto">Create Task</div>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/abf0b717729f936f37d6e7bd3471cd624ff26eefb03ede9842209d5507e349cc?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                  className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square"
                />
              </div> */}
              {/* <Link href="/createtask" passHref>
                <button
                  // onClick={handleCreateTask}
                  className="flex gap-8 items-center px-4 py-3.5 text-sm rounded-lg bg-custom-light-indigo"
                >
                  <div className="self-stretch my-auto">Create Task</div>
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/abf0b717729f936f37d6e7bd3471cd624ff26eefb03ede9842209d5507e349cc?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                    className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square"
                  />
                </button>
              </Link> */}
              {/* {showNavbar && <Createtask />} */}
            </div>
            <div className="mt-9 w-full max-md:max-w-full">
              <div className="flex gap-5 max-md:flex-col">
                <div className="flex flex-col w-[46%] max-md:ml-0 max-md:w-full">
                  <div className="grow pr-1.5 pl-8 w-full rounded-2xl bg-custom-light-indigo max-md:pl-5 max-md:mt-10 max-md:max-w-full">
                    <div className="flex gap-0 max-md:flex-col">
                      <div className="flex flex-col ml-0 w-[50%] max-md:ml-0 max-md:w-full">
                        <div className="flex z-10 flex-col self-stretch my-auto max-md:mt-10">
                          <div className="text-3xl font-medium text-white">
                            Hello {userData?.givenName}!
                          </div>
                          <div className="text-base text-amber-300 max-md:mr-2.5">
                            It’s good to see you again.
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col m-0 p-0 w-2/5 max-md:ml-0 max-md:w-full">
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/ae308c4ed73174abd5d84c8d9084b1a29d42e0bc886e9f972a741ceed420e619?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                          className="object-contain self-stretch my-auto w-full aspect-[1.35] max-md:mt-5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col ml-5 w-1/5 max-md:ml-0 max-md:w-full">
                  <div className="flex overflow-hidden flex-col pt-7 w-full rounded-2xl bg-custom-light-indigo max-md:mt-10">
                    <div className="flex flex-col px-6 max-md:px-5">
                      <div className="self-start text-3xl font-semibold leading-none text-white">
                        {eventsData?.length}
                      </div>
                      <div className="mt-2.5 text-lg leading-none text-stone-300">
                        Upcoming Task
                      </div>
                    </div>
                    <div className="flex shrink-0 mt-16 bg-amber-300 rounded-none h-[5px] w-[159px] max-md:mt-10" />
                  </div>
                </div>
                <div className="flex flex-col ml-5 w-1/5 max-md:ml-0 max-md:w-full">
                  <div className="flex overflow-hidden flex-col pt-7 w-full rounded-2xl bg-custom-light-indigo max-md:mt-10">
                    <div className="flex flex-col items-start px-6 max-md:px-5">
                      <div className="text-3xl font-semibold leading-none text-white">
                        {eventsData?.length}
                      </div>
                      <div className="mt-2.5 text-lg leading-none text-stone-300">
                        Total Task
                      </div>
                    </div>
                    <div className="flex shrink-0 mt-16 bg-amber-300 rounded-none h-[5px] w-[159px] max-md:mt-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* calendar class */}
            <Calendar />
          </div>
        </div>
      </div>
    </div>
  );
}
