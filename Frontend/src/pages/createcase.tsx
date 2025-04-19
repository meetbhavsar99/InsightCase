import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface ClientDetailsFormProps {
  clientName: string;
  staff: string;
  service: string;
  startAt: string;
}

interface Client {
  id: string;
  fullName: string;
}

interface Service {
  id: string;
  name: string;
}
interface Staff {
  id: string;
  name: string;
}

const ClientDetailsForm: React.FC<ClientDetailsFormProps> = ({
  clientName,
  staff,
  service,
  startAt: initialStartAt, // Rename prop to avoid conflict
}) => {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedClient, setSelectedClient] = useState(clientName);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState(staff);
  const [selectedService, setSelectedService] = useState(service);
  const [selectedRegion, setSelectedRegion] = useState<string>(""); // New state for region
  const [selectedStatus, setSelectedStatus] = useState<string>(""); // New state for status
  const [startAt, setStartAt] = useState(initialStartAt); // State for start date

  const regions = [
    "Windsor",
    "Leamington",
    "Harrow",
    "Amherstburg",
    "Tilbury",
    "Chatham",
  ];
  const statuses = ["Open", "Ongoing", "Close"];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/client",
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        const clientData = response.data.map((client: any) => ({
          id: client.id,
          fullName: `${client.first_name} ${client.last_name}`,
        }));
        setClients(clientData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    const fetchStaff = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/user",
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        const staffData = response.data.map((staff: any) => ({
          id: staff.id,
          name: staff.name,
        }));
        setStaffList(staffData);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/service",
          {
            headers: {
              "ngrok-skip-browser-warning": "true", // Add this header
            },
          }
        );
        const serviceData = response.data.map((service: any) => ({
          id: service.id,
          name: service.name,
        }));
        console.log(serviceData, "serviceData");
        setServices(serviceData);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchClients();
    fetchStaff();
    fetchServices(); // Fetch services here
  }, []);

  const handleSubmit = async () => {
    // Prevent default behavior for the click event
    // e.preventDefault();
    console.log("first");

    const selectedClientData = clients.find(
      (client) => client.fullName === selectedClient
    );
    console.log("hola");
    console.log(selectedService);

    const selectedServiceData = services.find(
      (service) => service.name === selectedService
    );
    const selectedStaffData = staffList.find(
      (staff) => staff.name === selectedStaff
    );

    console.log(
      selectedClientData?.fullName,
      selectedServiceData?.name,
      selectedStaffData
    );
    if (selectedClientData && selectedServiceData && selectedStaffData) {
      console.log("first");
      const data = {
        client_id: selectedClientData.id,
        service_id: selectedServiceData.id,
        staff_id: selectedStaffData.id, // Assuming staff id is the same as staff name
        start_at: startAt,
        region: selectedRegion.toUpperCase(),
        status: selectedStatus.toUpperCase(),
        case_manager_id: "2a697b79-62f1-4e1c-ab79-e0245619f85c", // Static value as per your requirement
      };

      try {
        // Sending the data to the specified endpoint
        const response = await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "/case",
          data,
          {
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        console.log("Response:", response.data); // Log the response
        router.push("/case"); // Redirect to /case page
      } catch (error) {
        console.error("Error submitting data:", error);

        // Type assertion for better error handling
        if (axios.isAxiosError(error)) {
          console.error("API Response:", error.response?.data); // Safe access to error response
          console.error("Error Message:", error.message);
        } else {
          // Handle unknown error types here
          console.error("Unexpected error:", error);
        }
      }
    }
  };

  interface InputFieldProps {
    label: string;
    value: string;
    isDate?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Add onChange prop
  }

  const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    isDate = false,
    onChange,
  }) => {
    return (
      <div className="flex flex-col mt-16 w-full text-sm font-medium text-white max-md:mt-10">
        <label
          htmlFor={label.toLowerCase().replace(" ", "-")}
          className="self-start"
        >
          {label}
        </label>
        <div className="flex gap-5 justify-between py-3 pr-5 pl-2 mt-2.5 rounded-lg bg-zinc-600">
          {isDate ? (
            <input
              type="date"
              value={value}
              onChange={onChange}
              className="bg-transparent border-none text-white"
            />
          ) : (
            <div>{value}</div>
          )}
          <img
            src={
              isDate
                ? "https://cdn.builder.io/api/v1/image/assets/TEMP/29d95f28c63baf9c902e478c6e96d543b413099df8333570e2db4882f14dfd1c?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a2613044"
                : "https://cdn.builder.io/api/v1/image/assets/TEMP/6de4bb2988311f02b00733baab499042405b6490526453f604364c8e13c554b7?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a2613044"
            }
            alt="Calendar Icon"
          />
        </div>
      </div>
    );
  };

  interface DropdownFieldProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { label: string; value: string }[];
  }

  const DropdownField: React.FC<DropdownFieldProps> = ({
    label,
    value,
    onChange,
    options,
  }) => {
    return (
      <div className="flex flex-col mt-16 w-full text-sm font-medium text-white">
        <label
          htmlFor={label.toLowerCase().replace(" ", "-")}
          className="self-start"
        >
          {label}
        </label>
        <select
          value={value}
          onChange={onChange}
          className="bg-zinc-600 py-3 rounded-lg mt-2 text-white"
        >
          <option value="" disabled>
            Select {label}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const SaveButton = () => {
    return (
      <button
        type="button"
        onClick={handleSubmit}
        className="bg-blue-600 text-white rounded-lg py-2 mt-6"
      >
        Save
      </button>
    );
  };

  return (
    <form
      className="flex overflow-hidden flex-col px-9 pt-6 pb-9 rounded-2xl bg-zinc-700 max-w-[867px] max-md:px-5"
      onSubmit={handleSubmit}
    >
      <div className="max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          <div className="flex flex-col w-[33%] max-md:ml-0 max-md:w-full">
            <DropdownField
              label="Client Name"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              options={clients.map((client) => ({
                label: client.fullName,
                value: client.fullName,
              }))}
            />
            <DropdownField
              label="Region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              options={regions.map((region) => ({
                label: region,
                value: region,
              }))}
            />
          </div>
          <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
            <DropdownField
              label="Staff"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              options={staffList.map((staff) => ({
                label: staff.name,
                value: staff.name,
              }))}
            />
            <DropdownField
              label="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statuses.map((status) => ({
                label: status,
                value: status,
              }))}
            />
          </div>
          <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
            <DropdownField
              label="Service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              options={services.map((service) => ({
                label: service.name,
                value: service.name,
              }))}
            />
            <InputField
              label="Start At"
              value={startAt}
              isDate
              onChange={(e) => setStartAt(e.target.value)} // Handle date change
            />
          </div>
        </div>
      </div>
      <SaveButton />
    </form>
  );
};

export default ClientDetailsForm;
