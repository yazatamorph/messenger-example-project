import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab",
    },
  },
  bubble: {
    height: 25,
    width: 25,
    background: "#3A8DFF",
    borderRadius: "50%",
    textAlign: "center",
    alignContent: "center",
  },
  text: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: -0.2,
    padding: 6,
  },
}));

const CountUnread = (props) => {
  const classes = useStyles();
  const { count } = props;
  return (
    <Box className={classes.bubble}>
      <Typography className={classes.text}>{count}</Typography>
    </Box>
  );
};

export default CountUnread;
