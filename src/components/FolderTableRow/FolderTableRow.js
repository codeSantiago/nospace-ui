import {
    Box,
    Button,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText, DialogTitle,
    Hidden,
    IconButton,
    Menu,
    MenuItem,
    TableCell,
    TableRow,
    Typography
} from '@material-ui/core';
import { Folder, MoreHoriz } from '@material-ui/icons';
import {useStyles} from '../../styles/TableRowStyles';
import React, {useReducer} from 'react';
import {deleteFolder, downloadFolder} from '../../utils/FolderUtils';

import MainSectionActions from "../MainSection/MainSecionActions";
import FolderTableRowActions from "./FolderTableRowActions";
import folderTableRowReducer from "./FolderTableRowReducer";

const initialState = {
    openMenu: false,
    displayWarning: false,
    anchorEl: null,
    folderSnackbar: {content: "", type: "", isOpen: false},
    isDeleteFileButtonDisabled: false
}

const FileTableRow = ({folder, mainDispatcher}) => {
    const classes = useStyles();
    const [state, dispatch] = useReducer(folderTableRowReducer, initialState);

    const updateRoutes = (name) => {
        mainDispatcher({type: MainSectionActions.ADD_NEW_ROUTE, route: name});
    }

    const download = () => {
        downloadFolder(folder.id)
            .then(response => {
                dispatch({type: FolderTableRowActions.CLOSE_MENU});
                const url = window.URL.createObjectURL(
                    new Blob([response.data], {type: response.headers.["content-type"]})
                );

                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", folder.folderName+".zip");
                document.body.appendChild(link);
                link.click();
            })
    }

    const deleteFolderById = () => {
        dispatch({type: FolderTableRowActions.DISABLE_DELETE_BUTTON});
        deleteFolder(folder.id)
            .then(_ => mainDispatcher(
                {type: MainSectionActions.DELETE_FOLDER, id: folder.id, folderName: folder.folderName}))
            .catch(_ => mainDispatcher({
                type: MainSectionActions.DELETE_FOLDER_FAILURE, folderName: folder.folderName}))
    }

    return (
        <>
        <TableRow className={classes.folderRow}>
            <TableCell className={classes.title} onClick={() => updateRoutes(folder.folderName)}>
                <Box className={classes.titleBox}>
                    <Folder className={classes.folderIcon}/>
                    <Typography>{folder.folderName}</Typography>
                </Box>
            </TableCell>
            <Hidden mdDown>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
            </Hidden>
            <TableCell>
                <IconButton aria-controls="options" 
                    onClick={(event) => dispatch({type: FolderTableRowActions.OPEN_MENU, anchorEl: event})}>
                    <MoreHoriz fontSize="small"/>
                </IconButton>
            </TableCell>
        </TableRow>

        <Menu id="options" anchorOrigin={{vertical: "bottom", horizontal: "left"}}
            open={state.openMenu} anchorEl={state.anchorEl} 
            onClose={() => dispatch({type: FolderTableRowActions.CLOSE_MENU})}
        >
            <MenuItem onClick={download}>Download</MenuItem>
            <MenuItem onClick={() => dispatch({type: FolderTableRowActions.DISPLAY_WARNING})}>Delete</MenuItem>
        </Menu>

        <Dialog open={state.displayWarning}>
            <DialogTitle>Delete folder {folder.folderName}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Deleting this folder will delete all the files and folders that are inside of it, are you
                    sure you want to delete this folder?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant={"contained"} color={"secondary"} onClick={() => dispatch({type: FolderTableRowActions.CLOSE_WARNING})}>
                    Cancel
                </Button>
                <Button variant={"outlined"} color={"primary"} onClick={deleteFolderById}
                disabled={state.isDeleteFileButtonDisabled}>
                    Delete folder
                </Button>
            </DialogActions>
        </Dialog>
        </>
    )
}

export default FileTableRow;