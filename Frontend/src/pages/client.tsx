import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import {
  TextField,
  MenuItem,
  Button,
  Select,
  FormControl,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ProtectedRoute from "@/components/ProtectedRoute";

interface TableDataRow {
  id: string;
  reference_number: number;
  referral_date: string;
  first_name: string;
  last_name: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  created_at: string;
  updated_at: string;
  _count: { cases: number };
}

interface FormData {
  id?: string;
  reference_number: number | "";
  referral_date: string;
  first_name: string;
  last_name: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  region: string;
}

// Define REGIONS constant
const REGIONS = [
  "WINDSOR",
  "LEAMINGTON",
  "HARROW",
  "AMHERSTBURG",
  "TILBURY",
  "CHATHAM",
];

// Define initialFormData constant
const initialFormData: FormData = {
  reference_number: "",
  referral_date: "",
  first_name: "",
  last_name: "",
  dob: "",
  email: "",
  phone: "",
  address: "",
  region: "",
};

export default function CaseTable() {
  const [tableData, setTableData] = useState<TableDataRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    clientId: string | null;
  }>({ isOpen: false, clientId: null });

  // Define fetchData function
  const fetchData = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/client",
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Define validateForm function
  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!formData.first_name?.trim()) {
      errors.first_name = "First name is required";
    }

    if (!formData.last_name?.trim()) {
      errors.last_name = "Last name is required";
    }

    if (!formData.dob) {
      errors.dob = "Date of birth is required";
    }

    if (!formData.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "Valid email is required";
    }

    if (!formData.phone?.match(/^\d+$/)) {
      errors.phone = "Phone must contain only numbers";
    }

    if (!formData.region) {
      errors.region = "Region is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Updated method to open delete confirmation
  const handleDeleteConfirmation = (clientId: string) => {
    setConfirmDelete({
      isOpen: true,
      clientId: clientId,
    });
  };

  // Modify this method to use the clientId from the confirmDelete state
  const handleDeleteClient = async () => {
    const clientId = confirmDelete.clientId;
    if (!clientId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/client/${clientId}`,
        {
          method: "DELETE",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete client");
      }

      await fetchData();
      // Close the delete confirmation modal
      setConfirmDelete({ isOpen: false, clientId: null });
    } catch (error) {
      console.error("Error deleting client:", error);
      alert(
        "This client cannot be deleted as one of the cases are still pending."
      );
    }
  };

  // Handle Edit Client
  const handleEditClient = (client: TableDataRow) => {
    // Trim any potential whitespace from the ID
    const cleanId = client.id.trim();

    setFormData({
      id: cleanId, // Use the cleaned ID
      reference_number: client.reference_number,
      referral_date: new Date(client.referral_date).toISOString().split("T")[0],
      first_name: client.first_name,
      last_name: client.last_name,
      dob: new Date(client.dob).toISOString().split("T")[0],
      email: client.email,
      phone: client.phone,
      address: client.address,
      region: client.region,
    });

    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && (!formData.id || formData.id.trim() === "")) {
        throw new Error("Invalid client ID");
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
      const url = isEditMode
        ? `${baseUrl}/client/${formData?.id?.trim()}`
        : `${baseUrl}/client`;

      const method = isEditMode ? "PATCH" : "POST";

      // Prepare request payload
      const requestPayload = {
        ...formData,
        id: formData.id ? formData.id.trim() : undefined,
        reference_number: Number(formData.reference_number),
        phone: String(formData.phone),
        referral_date: new Date(formData.referral_date).toISOString(),
        dob: new Date(formData.dob).toISOString(),
      };

      // Extensive logging
      console.log("Request Details:", {
        url,
        method,
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
        clientId: formData.id,
        fullPayload: requestPayload,
      });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(requestPayload),
      });

      // More detailed error handling
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Detailed Error Response:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url,
          method,
        });
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const responseData = await response.json();
      console.log("Success response:", responseData);

      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // Handle Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditMode(false);
  };

  // Handle Add Client Click
  const handleAddClientClick = () => {
    setIsEditMode(false);
    setIsModalOpen(true);
    setFormErrors({});
  };

  // Handle Input Change
  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = event.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="overflow-hidden pr-9 rounded-md bg-custom-dark-indigo max-md:pr-5">
      <div className="flex gap-5 max-md:flex-col">
        <Navbar />
        <div className="flex pt-10 ml-60 flex-col ml-5 w-[84%] max-md:ml-0 max-md:w-full">
          {/* Header section */}
          <div className="flex justify-between gap-10 items-center w-full font-semibold text-white max-md:max-w-full">
            <div className="my-auto text-2xl">Client Details</div>
            <button
              className="flex gap-8 items-center px-4 py-3.5 text-sm rounded-lg bg-custom-light-indigo"
              onClick={handleAddClientClick}
            >
              <div className="self-stretch my-auto">Add client</div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/abf0b717729f936f37d6e7bd3471cd624ff26eefb03ede9842209d5507e349cc"
                className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square"
                alt="Add client icon"
              />
            </button>
          </div>

          <div className="flex overflow-hidden flex-col mt-4 w-full rounded-lg bg-custom-light-indigo min-h-[777px] max-md:max-w-full">
            <div className="flex flex-wrap gap-4 items-center px-6 pt-5 pb-5 w-full max-md:px-5 max-md:max-w-full">
              <div className="flex flex-1 shrink self-stretch my-auto h-5 basis-0 min-w-[240px] w-[875px]" />
              <div className="flex gap-4 items-center self-stretch my-auto bg-custom-light-indigo">
                <div className="flex items-start self-stretch my-auto"></div>
              </div>
            </div>
            <TableContainer
              component={Paper}
              style={{ maxHeight: "400px", overflow: "auto" }}
              sx={{ backgroundColor: "#21222d" }}
            >
              <Table
                sx={{ minWidth: 650, backgroundColor: "#21222d" }}
                aria-label="simple table"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    {[
                      "#",
                      "Reference ID",
                      "First Name",
                      "Last Name",
                      "Date of Birth",
                      "Email",
                      "Phone",
                      "Actions",
                    ].map((header) => (
                      <TableCell
                        key={header}
                        sx={{ color: "white", backgroundColor: "#21222d" }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row, index) => (
                    <TableRow
                      key={row.id || index}
                      sx={{ backgroundColor: "#333443" }}
                    >
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#333443" }}
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#333443" }}
                      >
                        {row.reference_number}
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#333443" }}
                      >
                        {row.first_name}
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#333443" }}
                      >
                        {row.last_name}
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#333443" }}
                      >
                        {new Date(row.dob).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#333443" }}
                      >
                        {row.email}
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#333443" }}
                      >
                        {row.phone}
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#333443" }}
                      >
                        <div className="flex gap-2">
                          <IconButton
                            onClick={() => handleEditClient(row)}
                            sx={{ color: "white" }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteConfirmation(row.id)}
                            sx={{ color: "white" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Modal Form - Remains the same as in previous code */}
          <Modal open={isModalOpen} onClose={handleCloseModal}>
            <div className="flex justify-center items-center min-h-screen bg-opacity-60 bg-gray-900">
              <form
                onSubmit={handleFormSubmit}
                className="relative bg-custom-light-indigo text-white p-8 rounded-lg shadow-lg max-w-3xl w-full"
              >
                <IconButton
                  onClick={handleCloseModal}
                  className="absolute top-0 right-2 !text-white"
                >
                  <CloseIcon />
                </IconButton>

                <div className="grid grid-cols-3 gap-4">
                  {/* Reference ID */}
                  <FormControl fullWidth>
                    <label className="block text-white mb-1">
                      Reference ID
                    </label>
                    <TextField
                      name="reference_number"
                      type="number"
                      placeholder="Enter Reference ID"
                      value={formData.reference_number}
                      onChange={handleInputChange}
                      error={!!formErrors.reference_number}
                      helperText={formErrors.reference_number}
                      className="bg-gray-700 !text-white rounded-md"
                      InputProps={{ style: { color: "white" } }}
                    />
                  </FormControl>

                  {/* Referral Date */}
                  <FormControl fullWidth>
                    <label className="block text-white mb-1">
                      Referral Date
                    </label>
                    <TextField
                      name="referral_date"
                      type="date"
                      value={formData.referral_date}
                      onChange={handleInputChange}
                      error={!!formErrors.referral_date}
                      helperText={formErrors.referral_date}
                      className="bg-gray-700 !text-white rounded-md"
                      InputProps={{ style: { color: "white" } }}
                    />
                  </FormControl>

                  {/* First Name */}
                  <FormControl fullWidth>
                    <label className="block text-white mb-1">First Name</label>
                    <TextField
                      name="first_name"
                      type="string"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      error={!!formErrors.first_name}
                      helperText={formErrors.first_name}
                      className="bg-gray-700 !text-white rounded-md"
                      InputProps={{ style: { color: "white" } }}
                    />
                  </FormControl>

                  {/* Last Name */}
                  <FormControl fullWidth>
                    <label className="block text-white mb-1">Last Name</label>
                    <TextField
                      name="last_name"
                      type="string"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      error={!!formErrors.last_name}
                      helperText={formErrors.last_name}
                      className="bg-gray-700 !text-white rounded-md"
                      InputProps={{ style: { color: "white" } }}
                    />
                  </FormControl>

                  {/* Date of Birth */}
                  <FormControl fullWidth>
                    <label className="block text-white mb-1">
                      Date of Birth
                    </label>
                    <TextField
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleInputChange}
                      error={!!formErrors.dob}
                      helperText={formErrors.dob}
                      className="bg-gray-700 !text-white rounded-md"
                      InputProps={{ style: { color: "white" } }}
                    />
                  </FormControl>

                  {/* Email */}
                  <FormControl fullWidth>
                    <label className="block text-white mb-1">Email</label>
                    <TextField
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      className="bg-gray-700 !text-white rounded-md"
                      InputProps={{ style: { color: "white" } }}
                    />
                  </FormControl>

                  {/* Phone */}
                  <FormControl fullWidth>
                    <label className="block text-white mb-1">Phone</label>
                    <TextField
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      className="bg-gray-700 !text-white rounded-md"
                      InputProps={{ style: { color: "white" } }}
                    />
                  </FormControl>

                  {/* Address */}
                  <FormControl fullWidth>
                    <label className="block text-white mb-1">Address</label>
                    <TextField
                      name="address"
                      type="string"
                      value={formData.address}
                      onChange={handleInputChange}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                      className="bg-gray-700 !text-white rounded-md"
                      InputProps={{ style: { color: "white" } }}
                    />
                  </FormControl>

                  {/* Region */}
                  <FormControl fullWidth>
                    <label className="block !text-white mb-1">Region</label>
                    <Select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      error={!!formErrors.region}
                      className="bg-gray-700 !text-white rounded-md"
                    >
                      {REGIONS.map((region) => (
                        <MenuItem key={region} value={region}>
                          {region}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.region && (
                      <div className="text-red-500 text-sm mt-1">
                        {formErrors.region}
                      </div>
                    )}
                  </FormControl>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-10">
                  <Button
                    type="submit"
                    variant="contained"
                    style={{
                      backgroundColor: "#E4BE45",
                      width: "200px",
                      height: "50px",
                    }}
                    className="bg-yellow gap-8 text-white font-semibold rounded-lg"
                  >
                    Save
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
          <Modal
            open={confirmDelete.isOpen}
            onClose={() => setConfirmDelete({ isOpen: false, clientId: null })}
            aria-labelledby="delete-confirmation-title"
          >
            <Box
              sx={{
                position: "absolute" as const,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: "#21222d",
                // border: "2px solid #000",
                borderRadius: "12px",
                boxShadow: 24,
                p: 4,
                color: "white",
                textAlign: "center",
              }}
            >
              <h2 id="delete-confirmation-title" className="text-xl mb-4">
                Confirm Delete
              </h2>
              <p className="mb-4">
                Are you sure you want to delete this client?
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteClient()}
                >
                  Delete
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    setConfirmDelete({ isOpen: false, clientId: null })
                  }
                  sx={{ color: "white", borderColor: "white" }}
                >
                  Cancel
                </Button>
              </div>
            </Box>
          </Modal>
        </div>
      </div>
    </div>
  );
}
