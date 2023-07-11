import React from "react";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import './Footer.css'

const Footer = () => {
  return (
    <div>
      {/* bg-secondary */}
      <footer className="footer text-center fixed-bottom bg-cream">  
        <div className="container">
          <div className="row">
            {/* <!-- Footer Location--> */}
            <div className="col-lg-4 mb-5 mb-lg-0">
              {/* <h6>Location</h6> */}
              <p className="lead mb-0">Yavne, Israel</p>
            </div>
            {/* <!-- Footer Social Icons--> */}
            {/* FaFacebook, FaLinkedin */}
            <div className="col-lg-4 mb-5 mb-lg-0">
              {/* <h6>Follow us</h6> */}
              <a className="btn btn-outline btn-social mx-1" href="https://www.facebook.com/technoso.co.il">
                <FaFacebook/>
              </a>
              <a className="btn btn-outline  btn-social mx-1" href="https://il.linkedin.com/company/technoso">
                <FaLinkedin/>
              </a>
            </div>
            {/* <!-- Footer About Text--> */}
            <div className="col-lg-4">
              {/* <h6>Contact us</h6> */}
              <p className="lead mb-0">shir@technoco.co.il</p>
            </div>
          </div>
        </div>
      </footer>

      {/* for movement */}
      <div className="scroll-up-button">
        <a href="#top">
          <i className="fa fa-angle-up"></i>
        </a>
      </div>

      {/* <div className="copyright py-4 text-center">
        <div className="container">
          <small>© shir epshtain</small>
        </div>
      </div> */}
    </div>
  );
};

export default Footer;
