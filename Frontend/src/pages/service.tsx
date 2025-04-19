import * as React from "react";
import Navbar from "@/components/navbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface TableDataRow {
  id: string;
  name: string;
  initial_contact_days: number;
  intake_interview_days: number;
  action_plan_weeks: number;
  monthly_contact: boolean;
  monthly_reports: boolean;
}

interface FormData {
  id?: string;
  name: string;
  initial_contact_days: number;
  intake_interview_days: number;
  action_plan_weeks: number;
  monthly_contact: boolean;
  monthly_reports: boolean;
}

const MIN_DAYS = 1;
const MAX_DAYS = 365;
const MIN_WEEKS = 1;
const MAX_WEEKS = 52;

export default function ServiceComponent() {
  const [tableData, setTableData] = useState<TableDataRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    initial_contact_days: MIN_DAYS,
    intake_interview_days: MIN_DAYS,
    action_plan_weeks: MIN_WEEKS,
    monthly_contact: false,
    monthly_reports: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    serviceId: string | null;
  }>({ isOpen: false, serviceId: null });

  const fetchServices = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/service",
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data: TableDataRow[] = await response.json();
      setTableData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!formData.name) {
      errors.name = "Service name is required";
    }

    if (
      formData.initial_contact_days < MIN_DAYS ||
      formData.initial_contact_days > MAX_DAYS
    ) {
      errors.initial_contact_days = `Must be between ${MIN_DAYS} and ${MAX_DAYS} days`;
    }

    if (
      formData.intake_interview_days < MIN_DAYS ||
      formData.intake_interview_days > MAX_DAYS
    ) {
      errors.intake_interview_days = `Must be between ${MIN_DAYS} and ${MAX_DAYS} days`;
    }

    if (
      formData.action_plan_weeks < MIN_WEEKS ||
      formData.action_plan_weeks > MAX_WEEKS
    ) {
      errors.action_plan_weeks = `Must be between ${MIN_WEEKS} and ${MAX_WEEKS} weeks`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
      const url =
        isEditMode && formData.id
          ? `${baseUrl}/service/${formData.id}`
          : `${baseUrl}/service`;

      const method = isEditMode && formData.id ? "PATCH" : "POST";

      const payload = {
        name: formData.name,
        initial_contact_days: Number(formData.initial_contact_days),
        intake_interview_days: Number(formData.intake_interview_days),
        action_plan_weeks: Number(formData.action_plan_weeks),
        monthly_contact: formData.monthly_contact,
        monthly_reports: formData.monthly_reports,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchServices();
        handleCloseModal();
      } else {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        alert(`Error: ${errorData.message || "Failed to submit service"}`);
      }
    } catch (error) {
      console.error("Error submitting service:", error);
      alert("Error submitting service");
    }
  };

  const handleEditService = (service: TableDataRow) => {
    setFormData({
      id: service.id,
      name: service.name,
      initial_contact_days: service.initial_contact_days,
      intake_interview_days: service.intake_interview_days,
      action_plan_weeks: service.action_plan_weeks,
      monthly_contact: service.monthly_contact,
      monthly_reports: service.monthly_reports,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Updated method to open delete confirmation
  const openDeleteConfirmation = (serviceId: string) => {
    setConfirmDelete({
      isOpen: true,
      serviceId: serviceId,
    });
  };

  const handleDeleteService = async () => {
    if (!confirmDelete.serviceId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/service/${confirmDelete.serviceId}`,
        {
          method: "DELETE",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete service");
      }

      await fetchServices();
      setConfirmDelete({ isOpen: false, serviceId: null });
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      initial_contact_days: MIN_DAYS,
      intake_interview_days: MIN_DAYS,
      action_plan_weeks: MIN_WEEKS,
      monthly_contact: false,
      monthly_reports: false,
    });
    setFormErrors({});
    setIsEditMode(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      const newValue = [
        "initial_contact_days",
        "intake_interview_days",
        "action_plan_weeks",
      ].includes(name)
        ? Math.max(0, Number(value))
        : value;

      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      if (formErrors[name as keyof FormData]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    }
  };

  const handleCheckboxChange =
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));
    };

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#21222d",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    color: "white",
  };

  const inputStyle = {
    backgroundColor: "#2a2b37",
    borderRadius: "4px",
    "& .MuiInputLabel-root": {
      color: "white",
    },
    "& .MuiOutlinedInput-root": {
      color: "white",
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.23)",
      },
      "&:hover fieldset": {
        borderColor: "white",
      },
      "&.Mui-focused fieldset": {
        borderColor: "white",
      },
    },
  };

  return (
    <div className="overflow-hidden pr-9 rounded-md bg-custom-dark-indigo max-md:pr-5">
      <div className="flex gap-5 max-md:flex-col">
        <Navbar />
        <div className="flex flex-col ml-60 w-[84%] max-md:ml-0 max-md:w-full">
          <div className="flex flex-col self-stretch mb-auto mt-10 w-full max-md:mt-10 max-md:max-w-full">
            <div className="flex justify-between gap-10 items-center w-full font-semibold text-white max-md:max-w-full">
              <div className="my-auto text-2xl">Services</div>
              <button
                className="flex gap-8 items-center px-4 py-3.5 text-sm rounded-lg bg-custom-light-indigo"
                onClick={() => {
                  setIsEditMode(false);
                  setIsModalOpen(true);
                }}
              >
                <div className="self-stretch my-auto">Add Service</div>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/abf0b717729f936f37d6e7bd3471cd624ff26eefb03ede9842209d5507e349cc"
                  className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square"
                  alt="Add service icon"
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
                  aria-label="services table"
                  stickyHeader
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#21222d" }}
                      >
                        #
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#21222d" }}
                      >
                        Service Name
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#21222d" }}
                      >
                        Initial Contact Days
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#21222d" }}
                      >
                        Intake Interview Days
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#21222d" }}
                      >
                        Action Plan Week
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#21222d" }}
                      >
                        Monthly Contact
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#21222d" }}
                      >
                        Monthly Reports
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", backgroundColor: "#21222d" }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((row, index) => (
                      <TableRow
                        key={row.id}
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
                          {row.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          {row.initial_contact_days}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          {row.intake_interview_days}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          {row.action_plan_weeks}
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#333443" }}>
                          {row.monthly_contact ? (
                            <img
                              loading="lazy"
                              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e3b3158219e3022473f4f8f75875bca041d9a8edb180a5dcbdba7d365a8eb6d5?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                              className="object-contain self-stretch my-auto aspect-[1.1] w-[22px]"
                            />
                          ) : (
                            <img
                              loading="lazy"
                              src="https://cdn.builder.io/api/v1/image/assets/TEMP/2c55bb597fadc109fac373049c4c384debc5f56895926bfa891f5c283f6b9835?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                              className="object-contain self-stretch my-auto w-5 aspect-square"
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#333443" }}>
                          {row.monthly_reports ? (
                            <img
                              loading="lazy"
                              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e3b3158219e3022473f4f8f75875bca041d9a8edb180a5dcbdba7d365a8eb6d5?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                              className="object-contain self-stretch my-auto aspect-[1.1] w-[22px]"
                            />
                          ) : (
                            <img
                              loading="lazy"
                              src="https://cdn.builder.io/api/v1/image/assets/TEMP/2c55bb597fadc109fac373049c4c384debc5f56895926bfa891f5c283f6b9835?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
                              className="object-contain self-stretch my-auto w-5 aspect-square"
                            />
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "white",
                            backgroundColor: "#333443",
                          }}
                        >
                          <div className="flex gap-2">
                            <IconButton
                              onClick={() => handleEditService(row)}
                              sx={{ color: "white" }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => openDeleteConfirmation(row.id)}
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

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="modal-title"
      >
        <Box sx={modalStyle}>
          <h2 id="modal-title" className="text-xl mb-4">
            Add New Service
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Text Field for Service Name */}
            <TextField
              fullWidth
              label="Service Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={inputStyle}
            />

            <TextField
              fullWidth
              label="Initial Contact Days"
              type="number"
              name="initial_contact_days"
              value={formData.initial_contact_days}
              onChange={handleInputChange}
              error={!!formErrors.initial_contact_days}
              helperText={formErrors.initial_contact_days}
              inputProps={{ min: MIN_DAYS, max: MAX_DAYS }}
              sx={inputStyle}
            />

            <TextField
              fullWidth
              label="Intake Interview Days"
              type="number"
              name="intake_interview_days"
              value={formData.intake_interview_days}
              onChange={handleInputChange}
              error={!!formErrors.intake_interview_days}
              helperText={formErrors.intake_interview_days}
              inputProps={{ min: MIN_DAYS, max: MAX_DAYS }}
              sx={inputStyle}
            />

            <TextField
              fullWidth
              label="Action Plan Weeks"
              type="number"
              name="action_plan_weeks"
              value={formData.action_plan_weeks}
              onChange={handleInputChange}
              error={!!formErrors.action_plan_weeks}
              helperText={formErrors.action_plan_weeks}
              inputProps={{ min: MIN_WEEKS, max: MAX_WEEKS }}
              sx={inputStyle}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.monthly_contact}
                  onChange={handleCheckboxChange("monthly_contact")}
                  sx={{
                    color: "white",
                    "&.Mui-checked": { color: "white" },
                  }}
                />
              }
              label="Monthly Contact"
              sx={{ color: "white" }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.monthly_reports}
                  onChange={handleCheckboxChange("monthly_reports")}
                  sx={{
                    color: "white",
                    "&.Mui-checked": { color: "white" },
                  }}
                />
              }
              label="Monthly Reports"
              sx={{ color: "white" }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                backgroundColor: "#2a2b37",
                "&:hover": {
                  backgroundColor: "#363745",
                },
              }}
            >
              Add Service
            </Button>
          </form>
        </Box>
      </Modal>
      <Modal
        open={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, serviceId: null })}
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
          <p className="mb-4">Are you sure you want to delete this service?</p>
          <div className="flex justify-center gap-4">
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteService}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                setConfirmDelete({ isOpen: false, serviceId: null })
              }
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
