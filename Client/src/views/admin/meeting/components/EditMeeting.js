import {
  Button,
  Flex,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { putApi } from "services/api";
import { MeetingSchema } from "schema";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import Spinner from "components/spinner/Spinner";
import { LiaMousePointerSolid } from "react-icons/lia";
import { CUIAutoComplete } from "chakra-ui-autocomplete";
import { useEffect, useState, useCallback } from "react";
import { fetchLeadData } from "../../../../redux/slices/leadSlice";
import MultiLeadModel from "components/commonTableModel/MultiLeadModel";
import { fetchContactData } from "../../../../redux/slices/contactSlice";
import MultiContactModel from "components/commonTableModel/MultiContactModel";

const EditMeeting = (props) => {
  const dispatch = useDispatch();
  const { onClose, isOpen, setAction, meetingData, fetchData } = props;
  const [leaddata, setLeadData] = useState([]);
  const [contactdata, setContactData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contactModelOpen, setContactModel] = useState(false);
  const [leadModelOpen, setLeadModel] = useState(false);
  const todayTime = new Date().toISOString().split(".")[0];
  const leadData = useSelector((state) => state?.leadData?.data);
  const user = JSON.parse(localStorage.getItem("user"));
  const contactList = useSelector((state) => state?.contactData?.data);

  const initialValues = {
    agenda: meetingData?.agenda || "",
    attendees: meetingData?.attendees || [],
    attendeesLead: meetingData?.attendeesLead || [],
    location: meetingData?.location || "",
    related: meetingData?.related || null,
    dateTime: meetingData?.dateTime
      ? dayjs(meetingData.dateTime).format("YYYY-MM-DDTHH:mm")
      : "",
    notes: meetingData?.notes || "",
    createBy: user?._id,
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: MeetingSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      EditData();
      resetForm();
    },
  });
  const {
    errors,
    touched,
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = formik;

  const EditData = async () => {
    try {
      setIsLoading(true);
      let response = await putApi(`api/meeting/${meetingData._id}`, values);
      if (response.status === 200) {
        toast.success("Meeting updated successfully!");
        onClose();
        setAction((pre) => !pre);
        if (fetchData) {
          fetchData();
        }
      }
    } catch (e) {
      console.error("Error updating meeting:", e);
      toast.error("Failed to update meeting");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllData = useCallback(async () => {
    try {
      const contactResult = await dispatch(fetchContactData());
      if (contactResult.payload?.status === 200) {
        setContactData(contactResult.payload.data);
      }

      const leadResult = await dispatch(fetchLeadData());
      if (leadResult.payload?.status === 200) {
        setLeadData(leadResult.payload.data);
      }
    } catch (error) {
      //   console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    }
  }, [dispatch]);

  useEffect(() => {
    if (contactList) {
      setContactData(contactList);
    }
  }, [contactList]);

  useEffect(() => {
    if (leadData) {
      setLeadData(leadData);
    }
  }, [leadData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const extractLabels = (selectedItems) => {
    return selectedItems.map((item) => item._id);
  };

  const countriesWithEmailAsLabel = (
    values.related === "Contact" ? contactdata : leaddata
  )?.map((item) => ({
    ...item,
    value: item._id,
    label: values.related === "Contact" ? `${item.fullName}` : item.leadName,
  }));

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent height={"580px"}>
        <ModalHeader>Edit Meeting</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY={"auto"} height={"400px"}>
          <MultiContactModel
            data={contactdata}
            isOpen={contactModelOpen}
            onClose={setContactModel}
            fieldName="attendees"
            setFieldValue={setFieldValue}
          />
          <MultiLeadModel
            data={leaddata}
            isOpen={leadModelOpen}
            onClose={setLeadModel}
            fieldName="attendeesLead"
            setFieldValue={setFieldValue}
          />

          <Grid templateColumns="repeat(12, 1fr)" gap={3}>
            <GridItem colSpan={{ base: 12 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Agenda<Text color={"red"}>*</Text>
              </FormLabel>
              <Input
                fontSize="sm"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.agenda}
                name="agenda"
                placeholder="Agenda"
                fontWeight="500"
                borderColor={errors.agenda && touched.agenda ? "red.300" : null}
              />
              <Text fontSize="sm" mb="10px" color={"red"}>
                {errors.agenda && touched.agenda && errors.agenda}
              </Text>
            </GridItem>
            <GridItem colSpan={{ base: 12 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Related To<Text color={"red"}>*</Text>
              </FormLabel>
              <RadioGroup
                onChange={(e) => setFieldValue("related", e)}
                value={values.related}
              >
                <Stack direction="row">
                  <Radio value="Contact">Contact</Radio>
                  <Radio value="Lead">Lead</Radio>
                </Stack>
              </RadioGroup>
              <Text mb="10px" color={"red"} fontSize="sm">
                {errors.related && touched.related && errors.related}
              </Text>
            </GridItem>
            {(values.related === "Contact"
              ? (contactdata?.length ?? 0) > 0
              : (leaddata?.length ?? 0) > 0) &&
              values.related && (
                <GridItem colSpan={{ base: 12 }}>
                  <Flex alignItems={"end"} justifyContent={"space-between"}>
                    <Text w={"100%"}>
                      <CUIAutoComplete
                        label={`Choose Preferred Attendees ${
                          values.related === "Contact"
                            ? "Contact"
                            : values.related === "Lead" && "Lead"
                        }`}
                        placeholder="Type a Name"
                        name="attendees"
                        items={countriesWithEmailAsLabel}
                        className="custom-autoComplete"
                        selectedItems={countriesWithEmailAsLabel?.filter(
                          (item) =>
                            values.related === "Contact"
                              ? values?.attendees.includes(item._id)
                              : values.related === "Lead" &&
                                values?.attendeesLead.includes(item._id)
                        )}
                        onSelectedItemsChange={(changes) => {
                          const selectedLabels = extractLabels(
                            changes.selectedItems
                          );
                          values.related === "Contact"
                            ? setFieldValue("attendees", selectedLabels)
                            : values.related === "Lead" &&
                              setFieldValue("attendeesLead", selectedLabels);
                        }}
                      />
                    </Text>
                    <IconButton
                      mb={6}
                      onClick={() =>
                        values.related === "Contact"
                          ? setContactModel(true)
                          : values.related === "Lead" && setLeadModel(true)
                      }
                      fontSize="25px"
                      icon={<LiaMousePointerSolid />}
                    />
                  </Flex>
                  <Text color={"red"}>
                    {errors.attendees && touched.attendees && errors.attendees}
                  </Text>
                </GridItem>
              )}
            <GridItem colSpan={{ base: 12 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Location
              </FormLabel>
              <Input
                fontSize="sm"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.location}
                name="location"
                placeholder="Location"
                fontWeight="500"
                borderColor={
                  errors.location && touched.location ? "red.300" : null
                }
              />
              <Text mb="10px" color={"red"} fontSize="sm">
                {errors.location && touched.location && errors.location}
              </Text>
            </GridItem>
            <GridItem colSpan={{ base: 12 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Date Time<Text color={"red"}>*</Text>
              </FormLabel>
              <Input
                fontSize="sm"
                type="datetime-local"
                onChange={handleChange}
                onBlur={handleBlur}
                min={dayjs(todayTime).format("YYYY-MM-DD HH:mm")}
                value={values.dateTime}
                name="dateTime"
                placeholder="Date Time"
                fontWeight="500"
                borderColor={
                  errors.dateTime && touched.dateTime ? "red.300" : null
                }
              />
              <Text fontSize="sm" mb="10px" color={"red"}>
                {errors.dateTime && touched.dateTime && errors.dateTime}
              </Text>
            </GridItem>
            <GridItem colSpan={{ base: 12 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Notes
              </FormLabel>
              <Textarea
                resize={"none"}
                fontSize="sm"
                placeholder="Notes"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.notes}
                name="notes"
                fontWeight="500"
                borderColor={errors.notes && touched.notes ? "red.300" : null}
              />
              <Text mb="10px" color={"red"}>
                {errors.notes && touched.notes && errors.notes}
              </Text>
            </GridItem>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button
            size="sm"
            variant="brand"
            me={2}
            disabled={isLoading ? true : false}
            onClick={handleSubmit}
          >
            {isLoading ? <Spinner /> : "Update"}
          </Button>
          <Button
            sx={{
              textTransform: "capitalize",
            }}
            variant="outline"
            colorScheme="red"
            size="sm"
            onClick={() => {
              formik.resetForm();
              onClose();
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditMeeting;
