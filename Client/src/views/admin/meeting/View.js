import moment from "moment";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
} from "@chakra-ui/react";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";
import { getApi } from "services/api";
import Card from "components/card/Card";
import { deleteApi } from "services/api";
import { useEffect, useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { DeleteIcon } from "@chakra-ui/icons";
import { IoIosArrowBack } from "react-icons/io";
import Spinner from "components/spinner/Spinner";
import { HasAccess } from "../../../redux/accessUtils";
import { HSeparator } from "components/separator/Separator";
import CommonDeleteModel from "components/commonDeleteModel";
import { Link, useNavigate, useParams } from "react-router-dom";

const View = () => {
  const param = useParams();
  const params = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteMany, setDeleteMany] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchData = async () => {
    setIsLoading(true);
    let response = await getApi("api/meeting/view/", param.id);
    // console.log("response", response.data);
    setData(response?.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generatePDF = () => {
    setLoading(true);
    const element = document.getElementById("reports");
    const hideBtn = document.getElementById("hide-btn");
    if (element) {
      hideBtn.style.display = "none";
      html2pdf()
        .from(element)
        .set({
          margin: [0, 0, 0, 0],
          filename: `Meeting_Details_${moment().format("DD-MM-YYYY")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .save()
        .then(() => {
          setLoading(false);
          hideBtn.style.display = "";
        });
      // }, 500);
    } else {
      console.error("Element with ID 'reports' not found.");
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async () => {
    try {
      setIsLoading(true);
      let response = await deleteApi("api/meeting/delete/", params.id);
      if (response.status === 200) {
        setDeleteMany(false);
        toast.success("Meeting deleted successfully");
        navigate(-1);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete meeting");
    } finally {
      setIsLoading(false);
    }
  };

  const [permission, contactAccess, leadAccess] = HasAccess([
    "Meetings",
    "Contacts",
    "Leads",
  ]);

  return (
    <>
      {isLoading ? (
        <Flex justifyContent={"center"} alignItems={"center"} width="100%">
          <Spinner />
        </Flex>
      ) : (
        <>
          <Grid templateColumns="repeat(4, 1fr)" gap={3} id="reports">
            <GridItem colSpan={{ base: 4 }}>
              <Heading size="lg" m={3}>
                {data?.agenda || ""}
              </Heading>
            </GridItem>
            <GridItem colSpan={{ base: 4 }}>
              <Card>
                <Grid gap={4}>
                  <GridItem colSpan={2}>
                    <Box>
                      <Flex justifyContent={"space-between"}>
                        <Heading size="md" mb={3}>
                          Meeting Details
                        </Heading>
                        <Box id="hide-btn">
                          <Button
                            leftIcon={<FaFilePdf />}
                            size="sm"
                            variant="brand"
                            onClick={generatePDF}
                            disabled={loading}
                          >
                            {loading ? "Please Wait..." : "Print as PDF"}
                          </Button>
                          <Button
                            leftIcon={<IoIosArrowBack />}
                            size="sm"
                            variant="brand"
                            onClick={() => navigate(-1)}
                            style={{ marginLeft: 10 }}
                          >
                            Back
                          </Button>
                        </Box>
                      </Flex>
                      <HSeparator />
                    </Box>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Agenda{" "}
                    </Text>
                    <Text>{data?.agenda ? data?.agenda : " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Created By{" "}
                    </Text>
                    <Text>
                      {data?.createdByName ? data?.createdByName : " - "}
                    </Text>
                  </GridItem>

                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      DateTime{" "}
                    </Text>
                    <Text>
                      {" "}
                      {data?.dateTime
                        ? moment(data?.dateTime).format("DD-MM-YYYY  h:mma ")
                        : " - "}{" "}
                      [{data?.dateTime ? moment(data?.dateTime).toNow() : " - "}
                      ]
                    </Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Timestamp{" "}
                    </Text>
                    <Text>
                      {" "}
                      {data?.timestamp
                        ? moment(data?.timestamp).format("DD-MM-YYYY  h:mma ")
                        : " - "}{" "}
                      [
                      {data?.timestamp
                        ? moment(data?.timestamp).toNow()
                        : " - "}
                      ]
                    </Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Location{" "}
                    </Text>
                    <Text>{data?.location ? data?.location : " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Notes{" "}
                    </Text>
                    <Text>{data?.notes ? data?.notes : " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={"blackAlpha.900"}
                    >
                      {" "}
                      Attendes{" "}
                    </Text>
                    {data?.related === "Contact" && contactAccess?.view
                      ? data?.attendes &&
                        data?.attendes.map((item) => {
                          return (
                            <Link to={`/contactView/${item._id}`}>
                              <Text
                                color="brand.600"
                                sx={{
                                  "&:hover": {
                                    color: "blue.500",
                                    textDecoration: "underline",
                                  },
                                }}
                              >
                                {item.fullName}
                              </Text>
                            </Link>
                          );
                        })
                      : data?.related === "Lead" && leadAccess?.view
                      ? data?.attendesLead &&
                        data?.attendesLead.map((item) => {
                          return (
                            <Link to={`/leadView/${item._id}`}>
                              <Text
                                color="brand.600"
                                sx={{
                                  "&:hover": {
                                    color: "blue.500",
                                    textDecoration: "underline",
                                  },
                                }}
                              >
                                {item.leadName}
                              </Text>
                            </Link>
                          );
                        })
                      : data?.related === "contact"
                      ? data?.attendes &&
                        data?.attendes.map((item) => {
                          return (
                            <Text color="blackAlpha.900">
                              {item.firstName + " " + item.lastName}
                            </Text>
                          );
                        })
                      : data?.related === "lead"
                      ? data?.attendesLead &&
                        data?.attendesLead.map((item) => {
                          return (
                            <Text color="blackAlpha.900">{item.leadName}</Text>
                          );
                        })
                      : "-"}
                  </GridItem>
                  {/* <Grid templateColumns={'repeat(2, 1fr)'} gap={4} id="reports">

                                    </Grid> */}
                </Grid>
              </Card>
            </GridItem>
          </Grid>
          {(user.role === "superAdmin" ||
            permission?.update ||
            permission?.delete) && (
            <Card mt={3}>
              <Grid templateColumns="repeat(6, 1fr)" gap={1}>
                <GridItem colStart={6}>
                  <Flex justifyContent={"right"}>
                    {user.role === "superAdmin" || permission?.delete ? (
                      <Button
                        size="sm"
                        style={{ background: "red.800" }}
                        onClick={() => setDeleteMany(true)}
                        leftIcon={<DeleteIcon />}
                        colorScheme="red"
                      >
                        Delete
                      </Button>
                    ) : (
                      ""
                    )}
                  </Flex>
                </GridItem>
              </Grid>
            </Card>
          )}
        </>
      )}
      {/* Delete model */}
      <CommonDeleteModel
        isOpen={deleteMany}
        onClose={() => setDeleteMany(false)}
        type="Meeting"
        handleDeleteData={handleDeleteMeeting}
        ids={params.id}
      />
    </>
  );
};

export default View;
