import * as React from "react";
import axios from "axios";

export default function MyComponent() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    // Get form data
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      referenceId: formData.get("referenceId"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      dob: formData.get("dob"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      region: formData.get("region"),
    };

    try {
      // Send data using Axios
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/client",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      console.log(response);
      if (response.status === 200) {
        console.log("Data submitted successfully!");
      } else {
        console.error("Submission failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error in submission:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex overflow-hidden flex-col px-9 pt-6 pb-9 rounded-2xl bg-zinc-700 max-w-[867px] max-md:px-5"
    >
      <div className="max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          <div className="flex flex-col w-[33%] max-md:ml-0 max-md:w-full">
            <div className="flex flex-col grow mt-16 text-sm font-medium text-white max-md:mt-10">
              <div className="self-start">Reference ID</div>
              <input
                type="text"
                name="referenceId"
                defaultValue="R1001"
                className="px-2 py-3 mt-2.5 whitespace-nowrap rounded-lg bg-zinc-600 max-md:pr-5"
              />
            </div>
          </div>
          <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
            <div className="flex flex-col grow mt-16 text-sm font-medium text-white max-md:mt-10">
              <div className="self-start">First Name</div>
              <input
                type="text"
                name="firstName"
                defaultValue="John"
                className="px-2 py-3 mt-2.5 whitespace-nowrap rounded-lg bg-zinc-600 max-md:pr-5"
              />
            </div>
          </div>
          <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
            <div className="flex flex-col grow text-sm font-medium text-white max-md:mt-10">
              <div className="flex shrink-0 self-end w-11 h-11 rounded-full bg-zinc-600" />
              <div className="self-start mt-6">Last Name</div>
              <input
                type="text"
                name="lastName"
                defaultValue="Doe"
                className="px-2 py-3 mt-2.5 max-w-full whitespace-nowrap rounded-lg bg-zinc-600 w-[219px] max-md:pr-5 max-md:mr-1.5"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-10 items-center mt-10 text-sm font-medium text-white max-md:mr-1.5 max-md:max-w-full">
        <div className="flex flex-col self-stretch my-auto w-[219px]">
          <div className="self-start">Date of Birth</div>
          <input
            type="date"
            name="dob"
            defaultValue="1990-05-15"
            className="flex gap-5 justify-between py-3 pr-5 pl-2.5 mt-2.5 whitespace-nowrap rounded-lg bg-zinc-600"
          />
        </div>
        <div className="flex flex-col self-stretch my-auto whitespace-nowrap w-[219px]">
          <div className="self-start">Email</div>
          <input
            type="email"
            name="email"
            defaultValue="john12@gmail.com"
            className="px-2 py-3 mt-2.5 rounded-lg bg-zinc-600 max-md:pr-5"
          />
        </div>
        <div className="flex flex-col self-stretch my-auto w-[219px]">
          <div className="self-start">Phone</div>
          <input
            type="tel"
            name="phone"
            defaultValue="(555) 123-4567"
            className="px-2 py-3 mt-2.5 rounded-lg bg-zinc-600 max-md:pr-5"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-10 items-center self-start mt-10 text-sm font-medium text-white max-md:max-w-full">
        <div className="flex flex-col self-stretch my-auto w-[219px]">
          <div className="self-start">Address</div>
          <input
            type="text"
            name="address"
            defaultValue="123 Main St"
            className="px-2.5 py-3 mt-2.5 rounded-lg bg-zinc-600 max-md:pr-5"
          />
        </div>
        <div className="flex flex-col self-stretch my-auto whitespace-nowrap w-[219px]">
          <div className="self-start">Region</div>
          <input
            type="text"
            name="region"
            defaultValue="Windsor"
            className="flex gap-5 justify-between py-3 pr-5 pl-2 mt-2.5 rounded-lg bg-zinc-600"
          />
        </div>
      </div>
      <div className="self-center px-14 py-3.5 mt-16 max-w-full text-base font-bold text-white whitespace-nowrap bg-amber-300 rounded-lg shadow-[0px_4px_10px_rgba(77,72,151,0.3)] w-[157px] max-md:px-5 max-md:mt-10">
        <button type="submit" className="w-full h-full">
          Save
        </button>
      </div>
    </form>
  );
}
