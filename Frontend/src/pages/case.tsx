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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import {
  TextField,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import axios from "axios";
import router from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
// import { TableDataRow } from "@/types"; // Import the type interface

interface TableDataRow {
  id: string;
  client_id: string;
  case_manager_id: string;
  staff_id: string;
  service_id: string;
  region: string;
  status: string;
  opened_at: string;
  start_at: string;
  closed_at: string;
  created_at: string;
  updated_at: string;
  case_manager: { name: string };
  staff: { name: string };
  service: { name: string };
  client: { first_name: string; last_name: string };
  _count: { tasks: number };
}

// Define enums for region and status
const REGIONS = [
  "WINDSOR",
  "LEAMINGTON",
  "HARROW",
  "AMHERSTBURG",
  "TILBURY",
  "CHATHAM",
];
const STATUSES = ["OPEN", "ONGOING", "CLOSED"];

export default function CaseTable() {
  const [tableData, setTableData] = useState<TableDataRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<TableDataRow[]>(
    []
  );
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [caseTasks, setCaseTasks] = useState<any[]>([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedCaseForTask, setSelectedCaseForTask] = useState<string | null>(
    null
  );
  const [taskStaff, setTaskStaff] = useState<any[]>([]);
  const [taskFormData, setTaskFormData] = useState({
    case_id: "",
    staff_id: "",
    description: "",
    due_date: "",
  });

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    caseId: string | null;
  }>({ isOpen: false, caseId: null });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCaseData, setEditCaseData] = useState({
    id: "",
    client_id: "",
    case_manager_id: "",
    staff_id: "",
    service_id: "",
    region: "",
    status: "",
    start_at: "",
  });

  // Form data state
  const [formData, setFormData] = useState({
    client_id: "",
    case_manager_id: "",
    staff_id: "",
    service_id: "",
    region: "",
    status: "",
    start_at: "",
  });

  const fetchData = async (status?: string) => {
    try {
      // Fetch cases with optional status filter
      const caseResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/case${
          status ? `?status=${status}` : ""
        }`,
        {
          withCredentials: true,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setTableData(caseResponse.data);
      setFilteredTableData(caseResponse.data); // Ensure filtered data is also updated
    } catch (error) {
      console.error("Error fetching data:", error);
      setTableData([]); // Ensure an empty array is set on error
      setFilteredTableData([]); // Clear filtered data as well
    }
  };

  // New function to handle status filtering
  const handleStatusFilter = (status: string) => {
    setSelectedFilter(status);

    if (status === "All") {
      fetchData(); // Fetch all cases
    } else {
      fetchData(status); // Fetch cases with specific status
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Double-check exact endpoint paths
      const [clientsResponse, staffResponse, servicesResponse] =
        await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client`, {
            withCredentials: true,
            // Note: plural 'clients'
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
            withCredentials: true,
            // Note: plural 'staffs'
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/service`, {
            withCredentials: true,
            // Note: plural 'services'
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          }),
        ]);

      // Process responses
      setClients(clientsResponse.data || []);
      setStaff(staffResponse.data || []);
      setServices(servicesResponse.data || []);

      // Open the modal
      setIsModalOpen(true);
    } catch (error) {
      console.error("Dropdown Data Fetch Error:", error.response?.config?.url);
      console.error("Full Error:", error);

      // More specific error message
      alert(`Failed to load dropdown data. 
        Endpoint: ${error.response?.config?.url}
        Status: ${error.response?.status}`);

      // Fallback to empty arrays
      setClients([]);
      setStaff([]);
      setServices([]);
    }
  };

  const fetchCaseTasks = async (caseId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/task`,
        {
          params: {
            case_id: caseId, // Correctly filter tasks by case ID
          },
          withCredentials: true,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      // Filter tasks to ensure only tasks for this specific case are displayed
      const filteredTasks = response.data.filter(
        (task) => task.case_id === caseId
      );

      setCaseTasks(filteredTasks);
    } catch (error) {
      console.error("Error fetching case tasks:", error);
      setCaseTasks([]);
    }
  };

  const handleTaskStatusChange = async (taskId: string, completed: boolean) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/task/${taskId}`,
        {
          is_complete: completed,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      // Refresh tasks after update
      fetchCaseTasks(editCaseData.id);
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    }
  };

  // function to fetch staff for task assignment
  const fetchTaskStaff = async () => {
    try {
      const staffResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user`,
        {
          withCredentials: true,
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        }
      );
      // Remove the filter that was previously hiding some users
      setTaskStaff(staffResponse.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setTaskStaff([]);
    }
  };

  // Function to open add task modal
  const handleOpenAddTaskModal = (caseId: string) => {
    setSelectedCaseForTask(caseId);
    fetchTaskStaff();
    setIsAddTaskModalOpen(true);
  };

  // Handle task form input changes
  const handleTaskInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setTaskFormData((prevData) => ({
      ...prevData,
      [name]: value,
      case_id: selectedCaseForTask || "",
    }));
  };

  // Submit task form
  const handleTaskFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/task`,
        taskFormData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      // Reset form and close modal
      setIsAddTaskModalOpen(false);
      setTaskFormData({
        case_id: "",
        staff_id: "",
        description: "",
        due_date: "",
      });
      setSelectedCaseForTask(null);
      fetchData();

      // Optionally, you might want to refresh case data or show a success message
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    }
  };

  // Open modal for adding a new case
  const handleAddCaseClick = () => {
    // Only call fetchDropdownData
    fetchDropdownData();
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      client_id: "",
      case_manager_id: "",
      staff_id: "",
      service_id: "",
      region: "",
      status: "",
      start_at: "",
    });
  };

  // Fetch data for table and dropdowns
  useEffect(() => {
    fetchData(); // This will fetch all cases
    setSelectedFilter("All"); // Explicitly set filter to "All"
  }, []);

  // Handle form input change
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleFormSubmit = async (event: any) => {
    event.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/case`,
        {
          ...formData,
          case_manager_id: "2a697b79-62f1-4e1c-ab79-e0245619f85c",
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log(formData, "formData");
      // After submission, close modal and refresh case table
      handleCloseModal();
      fetchData();
      setFormData({
        client_id: "",
        case_manager_id: "",
        staff_id: "",
        service_id: "",
        region: "",
        status: "",
        start_at: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Delete case handler
  const handleDeleteConfirmation = (caseId: string) => {
    setConfirmDelete({
      isOpen: true,
      caseId: caseId,
    });
  };

  const handleDeleteCase = async () => {
    const caseId = confirmDelete.caseId;
    if (!caseId) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/case/${caseId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      // Refresh data after successful deletion
      fetchData();
      setConfirmDelete({ isOpen: false, caseId: null });
    } catch (error) {
      console.error("Error deleting case:", error);
      alert(
        `Failed to delete case: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Edit case handler
  const handleEditCase = (row: TableDataRow) => {
    setEditCaseData({
      id: row.id,
      client_id: row.client_id,
      case_manager_id: row.case_manager_id,
      staff_id: row.staff_id,
      service_id: row.service_id,
      region: row.region,
      status: row.status,
      start_at: row.start_at.split("T")[0],
    });

    // Fetch tasks for this case
    fetchCaseTasks(row.id);

    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const { name, value } = event.target;
    setEditCaseData({ ...editCaseData, [name]: value });
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/case/${editCaseData.id}`,
        {
          status: editCaseData.status,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      fetchData(); // Refresh data
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating case:", error);
      alert("Failed to update case");
    }
  };

  return (
    <div>
      <div className="pr-9 rounded-md bg-custom-dark-indigo max-md:pr-5">
        <div className="flex gap-5 max-md:flex-col">
          <Navbar />
          <div className="flex flex-col ml-60 w-[83%] max-md:ml-0 max-md:w-full">
            {/* Header */}
            <div className="flex justify-between gap-10 items-center w-full font-semibold text-white max-md:max-w-full mt-10">
              <div className="my-auto text-2xl">Case Details</div>
              <button
                onClick={handleAddCaseClick}
                className="flex items-center gap-8 px-4 py-3.5 text-sm rounded-lg bg-custom-light-indigo"
              >
                <div className="self-stretch my-auto">Add Case</div>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/abf0b717729f936f37d6e7bd3471cd624ff26eefb03ede9842209d5507e349cc"
                  className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square"
                  alt="Add Case"
                />
              </button>
            </div>

            {/* Table */}
            <div className="flex overflow-hidden flex-col mt-4 w-full rounded-lg bg-custom-light-indigo min-h-[777px] max-md:max-w-full">
              <div className="flex flex-wrap gap-4 items-center px-6 pt-5 pb-5 w-full max-md:px-5 max-md:max-w-full">
                <div className="flex flex-1 shrink self-stretch my-auto h-5 basis-0 min-w-[240px] w-[875px]" />
                <div className="flex gap-4 items-center self-stretch my-auto bg-custom-light-indigo">
                  <div className="flex items-start self-stretch my-auto">
                    {/* <div className="flex items-start text-white rounded-lg">
                      <div className="flex overflow-hidden gap-2 justify-center items-center px-4 py-2.5 rounded-lg bg-custom-light-indigo">
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/5875b96783249afcdda6028fb0ac9c2a8b1b00d54a36c45d450498274e024d49?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                          className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                        />
                        <div className="self-stretch my-auto">Delete </div>
                      </div>
                    </div> */}
                    {/* <div className="flex items-start text-white whitespace-nowrap rounded-lg">
                      <div className="flex overflow-hidden gap-2 justify-center items-center px-4 py-2.5 rounded-lg bg-custom-light-indigo">
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/e9a3281f6ba912ddd2b10f18e5aeaab0b6670f9d9a34254e2506f9230e109cb4?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                          className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                        />
                        <div className="self-stretch my-auto">Filters</div>
                      </div>
                    </div> */}
                    <div className="flex items-start text-white whitespace-nowrap rounded-lg">
                      <div className="flex overflow-hidden gap-2 justify-center items-center px-4 py-2.5 rounded-lg bg-custom-light-indigo">
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/e9a3281f6ba912ddd2b10f18e5aeaab0b6670f9d9a34254e2506f9230e109cb4?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                          className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                        />
                        <select
                          value={selectedFilter}
                          onChange={(e) => handleStatusFilter(e.target.value)}
                          className="bg-custom-light-indigo text-white outline-none"
                        >
                          <option value="All">Filter by: All</option>
                          <option value="OPEN">Filter by: Open</option>
                          <option value="ONGOING">Filter by: Ongoing</option>
                          <option value="CLOSED">Filter by: Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <TableContainer
                component={Paper}
                style={{ maxHeight: "400px", overflow: "auto" }}
                sx={{ backgroundColor: "#21222d" }}
              >
                <Table stickyHeader sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      {[
                        "#",
                        "Case Manager Name",
                        "Service Name",
                        "Client Name",
                        "Region",
                        "Status",
                        "Start Date",
                        "Number of Tasks",
                        "Actions",
                      ].map((header, index) => (
                        <TableCell
                          key={index}
                          sx={{
                            color: "white",
                            backgroundColor: "#21222d",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(Array.isArray(tableData) ? tableData : []).map(
                      (row, index) => (
                        <TableRow
                          key={row.id || index}
                          sx={{ backgroundColor: "#333443" }}
                        >
                          <TableCell sx={{ color: "white" }}>
                            {index + 1}
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            {row.case_manager?.name || "N/A"}
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            {row.service?.name || "N/A"}
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            {row.client?.first_name +
                              " " +
                              row.client?.last_name || "N/A"}
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            {row.region}
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            {row.status}
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            {new Date(row.start_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            <Link
                              href={`/task-detail?caseId=${row.id}`}
                              className="underline text-blue-400"
                            >
                              {row._count?.tasks || 0} Tasks
                            </Link>
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            <div className="flex gap-2">
                              <IconButton
                                onClick={() => handleOpenAddTaskModal(row.id)}
                                sx={{ color: "white" }}
                              >
                                <AddIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleEditCase(row)}
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
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        </div>

        {/* Modal for Add Case Form */}
        <Modal open={isModalOpen} onClose={handleCloseModal}>
          <div className="flex justify-center items-center min-h-screen bg-opacity-60 bg-gray-900">
            <form
              onSubmit={handleFormSubmit}
              className="relative bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl w-full"
            >
              {/* Close button */}
              <IconButton
                onClick={handleCloseModal}
                className="absolute top-0 right-0 !text-white"
              >
                <CloseIcon />
              </IconButton>

              <div className="grid grid-cols-2 gap-4">
                <FormControl fullWidth margin="normal">
                  <InputLabel className="!text-white">Client Name</InputLabel>
                  <Select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleInputChange}
                    className="bg-gray-700 !text-white rounded-md"
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel className="!text-white">Staff</InputLabel>
                  <Select
                    name="staff_id"
                    value={formData.staff_id}
                    onChange={handleInputChange}
                    className="bg-gray-700 !text-white rounded-md"
                  >
                    {staff
                      ?.filter((item) => item.name != "test")
                      .map((staffMember) => (
                        <MenuItem key={staffMember.id} value={staffMember.id}>
                          {staffMember.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel className="!text-white">Service</InputLabel>
                  <Select
                    name="service_id"
                    value={formData.service_id}
                    onChange={handleInputChange}
                    className="bg-gray-700 !text-white rounded-md"
                  >
                    {services.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel className="!text-white">Region</InputLabel>
                  <Select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="bg-gray-700 !text-white rounded-md"
                  >
                    {REGIONS.map((region) => (
                      <MenuItem key={region} value={region}>
                        {region}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel className="!text-white">Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="bg-gray-700 !text-white rounded-md"
                  >
                    {STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  margin="normal"
                  label="Start At"
                  type="date"
                  name="start_at"
                  value={formData.start_at}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                    className: "!text-white",
                  }}
                  InputProps={{
                    className: "bg-gray-700 !text-white rounded-md",
                  }}
                />
              </div>

              {/* Centered Save Button */}
              <div className="flex justify-center mt-6">
                <Button
                  variant="contained"
                  type="submit"
                  className="bg-yellow-500 text-gray-900 font-semibold rounded-md hover:bg-yellow-600"
                  style={{
                    width: "120px",
                  }}
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </Modal>
        {/* Modal for Edit Case Form */}
        <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <div className="flex justify-center items-center min-h-screen bg-opacity-60 bg-gray-900">
            <div className="relative bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl w-full">
              {/* Close button */}
              <IconButton
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-0 right-0 !text-white"
              >
                <CloseIcon />
              </IconButton>

              <div className="grid gap-4">
                {/* Case Status Section */}
                <div className="mb-4">
                  <h2 className="text-xl !text-white mb-4">Edit Case Status</h2>
                  <FormControl fullWidth margin="normal">
                    <InputLabel className="!text-white">Status</InputLabel>
                    <Select
                      name="status"
                      value={editCaseData.status}
                      onChange={handleEditInputChange}
                      className="bg-gray-700 !text-white rounded-md"
                    >
                      {STATUSES.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Tasks Section */}
                <div>
                  <h2 className="text-xl text-white mb-4">Tasks</h2>
                  {caseTasks.length === 0 ? (
                    <p className="text-gray-400">
                      No tasks found for this case.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {caseTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between bg-gray-700 p-3 rounded-md"
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={task.is_complete} // Changed from task.is_completed to task.is_complete
                              onChange={(e) =>
                                handleTaskStatusChange(
                                  task.id,
                                  e.target.checked
                                )
                              }
                              className="mr-3 form-checkbox text-yellow-500"
                            />
                            <div className="flex flex-col">
                              <span className="text-white">
                                {task.description}
                              </span>
                              <span className="text-sm text-gray-400">
                                Due:{" "}
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <span className="text-gray-400">
                            {task.is_complete ? "Completed" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Centered Save Button */}
              <div className="flex justify-center mt-6">
                <Button
                  variant="contained"
                  type="submit"
                  onClick={handleEditSubmit}
                  className="bg-yellow-500 text-gray-900 font-semibold rounded-md hover:bg-yellow-600"
                  style={{
                    width: "120px",
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Modal>
        {/* Modal for delete case*/}
        <Modal
          open={confirmDelete.isOpen}
          onClose={() => setConfirmDelete({ isOpen: false, caseId: null })}
        >
          <Box
            sx={{
              position: "absolute" as const,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "#21222d",
              borderRadius: "12px",
              boxShadow: 24,
              p: 4,
              color: "white",
              textAlign: "center",
            }}
          >
            <h2 className="text-xl mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this case?</p>
            <div className="flex justify-center gap-4">
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteCase}
              >
                Delete
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  setConfirmDelete({ isOpen: false, caseId: null })
                }
                sx={{ color: "white", borderColor: "white" }}
              >
                Cancel
              </Button>
            </div>
          </Box>
        </Modal>

        <Modal
          open={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
        >
          <div className="flex justify-center items-center min-h-screen bg-opacity-60 bg-gray-900">
            <form
              onSubmit={handleTaskFormSubmit}
              className="relative bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl w-full"
            >
              <IconButton
                onClick={() => setIsAddTaskModalOpen(false)}
                className="absolute top-0 right-0 !text-white"
              >
                <CloseIcon />
              </IconButton>

              <h2 className="text-xl text-white mb-4">Create New Task</h2>

              <div className="grid gap-4">
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Task Description"
                  value={taskFormData.description}
                  onChange={handleTaskInputChange}
                  InputLabelProps={{
                    className: "!text-white",
                  }}
                  InputProps={{
                    className: "bg-gray-700 !text-white rounded-md",
                  }}
                />

                <TextField
                  fullWidth
                  type="date"
                  name="due_date"
                  label="Due Date"
                  value={taskFormData.due_date}
                  onChange={handleTaskInputChange}
                  InputLabelProps={{
                    shrink: true,
                    className: "!text-white",
                  }}
                  InputProps={{
                    className: "bg-gray-700 !text-white rounded-md",
                  }}
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel className="!text-white">
                    Assigned Staff
                  </InputLabel>
                  <Select
                    name="staff_id"
                    value={taskFormData.staff_id}
                    onChange={handleTaskInputChange}
                    className="bg-gray-700 !text-white rounded-md"
                  >
                    {taskStaff.map((staffMember) => (
                      <MenuItem key={staffMember.id} value={staffMember.id}>
                        {staffMember.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  variant="contained"
                  type="submit"
                  className="bg-yellow-500 text-gray-900 font-semibold rounded-md hover:bg-yellow-600"
                  style={{
                    width: "120px",
                  }}
                >
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}
