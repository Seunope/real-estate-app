import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { CiMenuKebab } from "react-icons/ci";
import { useEffect, useState } from "react";
import { SearchIcon } from "@chakra-ui/icons";
import AddMeeting from "./components/Addmeeting";
import { Link, useNavigate } from "react-router-dom";
import { DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { HasAccess } from "../../../redux/accessUtils";
import { deleteManyApi, deleteApi } from "services/api";
import CommonDeleteModel from "components/commonDeleteModel";
import MeetingAdvanceSearch from "./components/MeetingAdvanceSearch";
import { fetchMeetingData } from "../../../redux/slices/meetingSlice";
import CommonCheckTable from "../../../components/reactTable/checktable";

const Index = () => {
  const title = "Meeting";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [action, setAction] = useState(false);
  const [permission] = HasAccess(["Meetings"]);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteMany, setDeleteMany] = useState(false);
  const [searchedData, setSearchedData] = useState([]);
  // const user = JSON.parse(localStorage.getItem("user"));
  const [selectedValues, setSelectedValues] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState(false);
  const [searchboxOutside, setSearchboxOutside] = useState("");
  const [getTagValuesOutSide, setGetTagValuesOutside] = useState([]);
  const [displaySearchData, setDisplaySearchData] = useState(false);

  const actionHeader = {
    Header: "Action",
    isSortable: false,
    center: true,
    cell: ({ row }) => (
      <Text fontSize="md" fontWeight="900" textAlign={"center"}>
        <Menu isLazy>
          <MenuButton>
            <CiMenuKebab />
          </MenuButton>
          <MenuList
            minW={"fit-content"}
            transform={"translate(1520px, 173px);"}
          >
            {permission?.view && (
              <MenuItem
                py={2.5}
                color={"green"}
                onClick={() => navigate(`/metting/${row?.values._id}`)}
                icon={<ViewIcon fontSize={15} />}
              >
                View
              </MenuItem>
            )}
            {permission?.edit && (
              <MenuItem
                py={2.5}
                color={"green"}
                onClick={() => navigate(`/metting/${row?.values._id}`)}
                icon={<ViewIcon fontSize={15} />}
              >
                Edit
              </MenuItem>
            )}
            {permission?.delete && (
              <MenuItem
                py={2.5}
                color={"red"}
                onClick={() => {
                  setDeleteMany(true);
                  setSelectedValues([row?.values?._id]);
                }}
                icon={<DeleteIcon fontSize={15} />}
              >
                Delete
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </Text>
    ),
  };
  const tableColumns = [
    {
      Header: "#",
      accessor: "_id",
      isSortable: false,
      width: 10,
    },
    {
      Header: "Agenda",
      accessor: "agenda",
      cell: (cell) => (
        <Link to={`/metting/${cell?.row?.values._id}`}>
          {" "}
          <Text
            me="10px"
            sx={{
              "&:hover": { color: "blue.500", textDecoration: "underline" },
            }}
            color="brand.600"
            fontSize="sm"
            fontWeight="700"
          >
            {cell?.value || " - "}
          </Text>
        </Link>
      ),
    },
    { Header: "Date & Time", accessor: "dateTime" },
    { Header: "Time Stamp", accessor: "timestamp" },
    { Header: "Create By", accessor: "createdByName" },
    ...(permission?.update || permission?.view || permission?.delete
      ? [actionHeader]
      : []),
  ];

  const fetchData = async () => {
    setIsLoading(true);
    const result = await dispatch(fetchMeetingData());
    if (result.payload.status === 200) {
      setData(result?.payload?.data);
    } else {
      toast.error("Failed to fetch data", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteMeeting = async (ids) => {
    try {
      setIsLoading(true);

      let response;
      if (ids.length > 1) {
        response = await deleteManyApi("api/meeting/deleteMany", { ids });
      } else {
        response = await deleteApi("api/meeting/delete/", ids[0]);
      }

      if (response.status === 200) {
        setSelectedValues([]);
        setDeleteMany(false);
        setAction((pre) => !pre);

        const message =
          ids.length > 1
            ? `${ids.length} meetings deleted successfully`
            : "Meeting deleted successfully";
        toast.success(message);
      }
    } catch (error) {
      console.log(error);

      const message =
        ids.length > 1
          ? "Failed to delete meetings"
          : "Failed to delete meeting";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // const [selectedColumns, setSelectedColumns] = useState([...tableColumns]);
  // const dataColumn = tableColumns?.filter(item => selectedColumns?.find(colum => colum?.Header === item.Header))

  useEffect(() => {
    fetchData();
  }, [action]);

  return (
    <div>
      <CommonCheckTable
        title={title}
        isLoading={isLoading}
        columnData={tableColumns ?? []}
        // dataColumn={dataColumn ?? []}
        allData={data ?? []}
        tableData={data}
        searchDisplay={displaySearchData}
        setSearchDisplay={setDisplaySearchData}
        searchedDataOut={searchedData}
        setSearchedDataOut={setSearchedData}
        tableCustomFields={[]}
        access={permission}
        // action={action}
        // setAction={setAction}
        // selectedColumns={selectedColumns}
        // setSelectedColumns={setSelectedColumns}
        // isOpen={isOpen}
        // onClose={onClose}
        onOpen={onOpen}
        selectedValues={selectedValues}
        setSelectedValues={setSelectedValues}
        setDelete={setDeleteMany}
        AdvanceSearch={
          <Button
            variant="outline"
            colorScheme="brand"
            leftIcon={<SearchIcon />}
            mt={{ sm: "5px", md: "0" }}
            size="sm"
            onClick={() => setAdvanceSearch(true)}
          >
            Advance Search
          </Button>
        }
        getTagValuesOutSide={getTagValuesOutSide}
        searchboxOutside={searchboxOutside}
        setGetTagValuesOutside={setGetTagValuesOutside}
        setSearchboxOutside={setSearchboxOutside}
        handleSearchType="MeetingSearch"
      />

      <MeetingAdvanceSearch
        advanceSearch={advanceSearch}
        setAdvanceSearch={setAdvanceSearch}
        setSearchedData={setSearchedData}
        setDisplaySearchData={setDisplaySearchData}
        allData={data ?? []}
        setAction={setAction}
        setGetTagValues={setGetTagValuesOutside}
        setSearchbox={setSearchboxOutside}
      />
      <AddMeeting setAction={setAction} isOpen={isOpen} onClose={onClose} />

      {/* Delete model */}
      <CommonDeleteModel
        isOpen={deleteMany}
        onClose={() => setDeleteMany(false)}
        type={selectedValues.length === 1 ? "Meeting" : "Meetings"}
        handleDeleteData={handleDeleteMeeting}
        ids={selectedValues}
      />
    </div>
  );
};

export default Index;
