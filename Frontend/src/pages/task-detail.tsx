import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from "axios";

interface TaskData {
  id: string;
  case_id: string;
  staff_id: string;
  description: string;
  due_date: string;
  is_complete: boolean;
  completed_at: string | null;
  staff: {
    id: string;
    name: string;
  };
}

interface FormData {
  id?: string;
  staff_id?: string;
  case_id: string;
  description: string;
  due_date: string;
  is_complete: boolean;
}

interface CaseData {
  id: string;
  case_number: string;
  staff_id: string;
}

const initialFormData: FormData = {
  case_id: "",
  staff_id: "",
  description: "",
  due_date: "",
  is_complete: false,
};

export default function TaskDetail() {
  const [taskData, setTaskData] = useState<TaskData[]>([]);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [staff, setStaff] = useState([]);
  const router = useRouter();
  const { caseId } = router.query;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    taskId: string | null;
  }>({ isOpen: false, taskId: null });

  const fetchData = async () => {
    try {
      // Fetch Tasks with expanded staff information
      const taskResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/task`,
        {
          headers: { "ngrok-skip-browser-warning": "true" },
        }
      );
      const taskData = await taskResponse.json();

      const caseResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/case`,
        {
          headers: { "ngrok-skip-browser-warning": "true" },
        }
      );

      const CaseData = await caseResponse.data;
      setCases(CaseData);

      const filteredData = caseId
        ? taskData.filter((task: TaskData) => task.case_id === caseId)
        : taskData;

      setTaskData(filteredData);

      // Rest of the existing code remains the same
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      // Filter staff by roles
      const staffData = response.data;
      setStaff(staffData);
    } catch (error) {
      console.error("Error fetching staff data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStaff();
  }, [caseId]);

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.due_date) {
      errors.due_date = "Due date is required";
    }

    if (!formData.case_id?.trim()) {
      errors.case_id = "Case ID is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeleteConfirmation = (taskId: string) => {
    setConfirmDelete({
      isOpen: true,
      taskId: taskId,
    });
  };

  const handleDeleteTask = async () => {
    const taskId = confirmDelete.taskId;
    if (!taskId) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/task/${taskId}`, {
        withCredentials: true,
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      await fetchData();
      setConfirmDelete({ isOpen: false, taskId: null });
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    }
  };

  const handleEditTask = (task: TaskData) => {
    setFormData({
      id: task.id,
      case_id: task.case_id,
      description: task.description,
      due_date: new Date(task.due_date).toISOString().split("T")[0],
      is_complete: task.is_complete,
    });

    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = isEditMode
        ? {
            staff_id: formData.staff_id,
            description: formData.description,
            due_date: new Date(formData.due_date).toISOString(),
            is_complete: formData.is_complete,
          }
        : {
            case_id: formData.case_id,
            staff_id: formData.staff_id,
            description: formData.description,
            due_date: new Date(formData.due_date).toISOString(),
          };

      const url = `${process.env.NEXT_PUBLIC_API_URL}/task${
        isEditMode ? `/${formData.id}` : ""
      }`;
      const method = isEditMode ? "patch" : "post";

      await axios({
        method,
        url,
        data: payload,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      await fetchData(); // Refresh task data
      handleCloseModal(); // Close modal after success
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditMode(false);
  };

  const handleAddTaskClick = () => {
    setIsEditMode(false);
    setIsModalOpen(true);
    setFormErrors({});
  };

  return (
    <div className="overflow-hidden pr-9 rounded-md bg-custom-dark-indigo max-md:pr-5">
      <div className="flex gap-5 max-md:flex-col">
        <Navbar />
        <div className="flex flex-col ml-60 w-[84%] max-md:ml-0 max-md:w-full">
          <div className="flex flex-col self-stretch mb-auto mt-10 w-full max-md:mt-10 max-md:max-w-full">
            <div className="flex justify-between gap-10 items-center w-full font-semibold text-white max-md:max-w-full">
              <div className="my-auto text-2xl">Task Details</div>
              <button
                className="flex gap-8 items-center px-4 py-3.5 text-sm rounded-lg bg-custom-light-indigo"
                onClick={handleAddTaskClick}
              >
                <div className="self-stretch my-auto">Create Task</div>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/abf0b717729f936f37d6e7bd3471cd624ff26eefb03ede9842209d5507e349cc"
                  className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square"
                  alt="Create task icon"
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
                  aria-label="task details table"
                  stickyHeader
                >
                  <TableHead>
                    <TableRow>
                      {[
                        "#",
                        "Case",
                        "Staff",
                        "Description",
                        "Due Date",
                        "Completed",
                        "Completed At",
                        "Actions",
                      ].map((header) => (
                        <TableCell
                          key={header}
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
                    {taskData.map((task, index) => (
                      <TableRow
                        key={task.id}
                        sx={{ backgroundColor: "#333443" }}
                      >
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          <a
                            href={`/task?case_id=${task.case_id}`}
                            className="text-blue-400 underline hover:text-blue-300"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push({
                                pathname: "/case",
                                query: { id: task.case_id },
                              });
                            }}
                          >
                            Case
                          </a>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          {task.staff?.name || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          {task.description}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          {new Date(task.due_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            timeZone: "UTC",
                          })}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          {task.is_complete ? "Yes" : "No"}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          {task.completed_at
                            ? new Date(task.completed_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  timeZone: "UTC",
                                }
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          <div className="flex gap-2">
                            <IconButton
                              onClick={() => handleEditTask(task)}
                              sx={{ color: "white" }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteConfirmation(task.id)}
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
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <div className="flex justify-center items-center min-h-screen bg-opacity-60 bg-gray-900">
          <form
            onSubmit={handleFormSubmit}
            className="relative bg-custom-light-indigo !text-white p-8 rounded-lg shadow-lg max-w-3xl w-full"
          >
            <IconButton
              onClick={handleCloseModal}
              className="absolute top-0 right-2 !text-white"
            >
              <CloseIcon />
            </IconButton>

            <div className="grid grid-cols-3 gap-4 mt-5">
              {/* Select Case Dropdown (Only for Create Mode) */}
              {!isEditMode && (
                <FormControl fullWidth>
                  <InputLabel className="block !text-white mb-1">
                    Select Case
                  </InputLabel>
                  <Select
                    name="case_id"
                    value={formData.case_id}
                    onChange={handleInputChange}
                    error={!!formErrors.case_id}
                    className="bg-gray-700 !text-white rounded-md"
                  >
                    {cases.map((caseItem) => (
                      <MenuItem key={caseItem.id} value={caseItem.id}>
                        Client -{" "}
                        {caseItem.client.first_name + caseItem.client.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.case_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.case_id}
                    </p>
                  )}
                </FormControl>
              )}

              {!isEditMode && (
                <FormControl fullWidth>
                  <InputLabel className="block !text-white mb-1">
                    Assign Staff
                  </InputLabel>
                  <Select
                    name="staff_id"
                    value={formData.staff_id}
                    onChange={handleInputChange}
                    error={!!formErrors.staff_id}
                    className="bg-gray-700 !text-white rounded-md"
                  >
                    {staff.map((staffMember) => (
                      <MenuItem key={staffMember.id} value={staffMember.id}>
                        {staffMember.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.staff_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.staff_id}
                    </p>
                  )}
                </FormControl>
              )}

              {/* Description */}
              {/* <FormControl fullWidth> */}
              {/* <InputLabel className="block text-white mb-1">
                  Description
                </InputLabel> */}
              <TextField
                fullWidth
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                className="bg-gray-700 !text-white rounded-md"
                InputLabelProps={{
                  shrink: true,
                  className: "!text-white",
                }}
                InputProps={{
                  className: "bg-gray-700 !text-white rounded-md",
                }}
              />
              {/* </FormControl> */}

              {/* Due Date */}
              {/* <FormControl fullWidth>
                <InputLabel className="block text-white mb-1">
                  Due Date
                </InputLabel> */}
              <TextField
                name="due_date"
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={handleInputChange}
                error={!!formErrors.due_date}
                helperText={formErrors.due_date}
                className="bg-custom-lighter-indigo rounded-md"
                // InputProps={{ style: { color: "white" } }}
                InputLabelProps={{
                  shrink: true,
                  className: "!text-white",
                }}
                InputProps={{
                  className: "bg-gray-700 !text-white rounded-md",
                }}
              />
              {/* </FormControl> */}

              {/* Status Checkbox (Only for Edit Mode) */}
              {isEditMode && (
                <FormControl fullWidth>
                  <label className="block text-white mb-1">Task Status</label>
                  <Box display="flex" alignItems="center" gap={2}>
                    <label className="text-white">Completed:</label>
                    <input
                      type="checkbox"
                      name="is_complete"
                      checked={formData.is_complete}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_complete: e.target.checked,
                        }))
                      }
                    />
                  </Box>
                </FormControl>
              )}
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
                {isEditMode ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, taskId: null })}
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
          <p className="mb-4">Are you sure you want to delete this task?</p>
          <div className="flex justify-center gap-4">
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteTask}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              onClick={() => setConfirmDelete({ isOpen: false, taskId: null })}
              sx={{ color: "white", borderColor: "white" }}
            >
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
