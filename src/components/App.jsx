import { useEffect, useState } from "react";
import { Searchbar } from "./Searchbar/Searchbar";
import { serviceGetImages } from "api";
import { ErrorMsg, Layout } from "./Layout";
import { GlobalStyle } from "./GlobalStyle";
import { Loader } from "./Loader/Loader";
import { ImageGallery } from "./ImageGallery/ImageGallery";
import { Button } from "./Button/Button";
import {EndGallery} from "./EndGallery/EndGallery"
import Modal from "./Modal/Modal";

export const App =()=> {
  const [gallery, setGallery] = useState([]);
  const [query, setQuery] = useState({
    searchString: '',
    page: 1,
    perPage: 12,
    totalHits: 0,
    timeStamp: null,
  });
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bigImgUrl, setBigImgUrl] = useState('');

  useEffect((prevQuery) => {
    if (query.timeStamp === null) return
    async function getImages(){
      try {
        setLoader(true);
        setError(false);
        const responce = await serviceGetImages(query);
        setGallery(prevImg=>([...prevImg, ...responce.hits]));
        setQuery(prevQuery=>({...prevQuery, totalHits: responce.totalHits}));
      } catch (error) {
        setError(true);
      } finally {
        setLoader(false);
      }
    }
    getImages()
  }, [query.timeStamp, query.page]);

  useEffect(()=>scrollUp, [gallery, query.page]);

  const handleChange = (ev) => {
    setQuery(prevQuery=>({...prevQuery, searchString: ev.target.value}));
  };
  
  const handleSubmit = (ev) =>{
    ev.preventDefault();
    setQuery(prevQuery=>({...prevQuery, searchString: ev.target.search.value, page: 1, timeStamp: Date.now()}));
    setGallery([]);
  }

  const handleLoadMore = () =>{
    setQuery(prevQuery=>({...prevQuery, page: prevQuery.page + 1}));
  }

  function scrollUp(){
    const height = (window.innerHeight - 128) / 18;
    function scr(){
      window.scrollBy(0, height)
    }
    for (let i = 1; i < 19; i++) {
      const delay = i*50;
      setTimeout(scr, delay);
    }
  }

  const toggleModal = () => {
    setShowModal(prevModal=>(!prevModal));
  };

  const handleImgClick = (bigImgUrl) =>{
    setBigImgUrl(bigImgUrl);
    setShowModal(true);
  }

    const {searchString, page, perPage, totalHits, timeStamp} = query;
    const showGallery = (gallery.length>0);
    const showEndGallery = ((totalHits / perPage) < page);
    const showBtnMore = !showEndGallery && showGallery;
    const showError = error && !showEndGallery;
    
    return(
      <Layout>
        <Searchbar search={searchString} onChange={handleChange} onSubmit={handleSubmit} />
        {showGallery && <ImageGallery gallery={gallery} onClick={handleImgClick}/>}
        {loader && <Loader />}
        {showBtnMore && <Button onClick={handleLoadMore} />}        
        {showEndGallery && !!totalHits && <EndGallery />}
        {!loader && !showGallery && !!timeStamp && <ErrorMsg>Sorry, but nothing was found for your query. Try changing the request.</ErrorMsg>}
        {showError && <ErrorMsg>Sorry, something went wrong. Try reload page</ErrorMsg>}
        {showModal && <Modal onClose={toggleModal} ><img src={bigImgUrl} alt='zoomed' /></Modal>}
        <GlobalStyle />
      </Layout>
    )
};
