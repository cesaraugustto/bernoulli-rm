import { useState, useEffect } from 'react';
import { Row, Col, Alert, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.scss';
import { useDispatch } from "react-redux";
import { setPageTitle } from "../redux/slices/pageTitleSlice";
import { setPageSubtitle } from '../redux/slices/pageSubtitleSlice';

export default function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setPageTitle("CIPA"));
    dispatch(setPageSubtitle("Vote no seu representante agora!"));
  }, [dispatch]);


  return (
    <>


    </>
  );
}