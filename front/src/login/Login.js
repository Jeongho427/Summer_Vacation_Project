import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../Fonts/Font.css";
import axios from "axios";
import "./Main.css";

import { useHistory } from "react-router-dom";

var url = "http://localhost:8080";

// 비밀번호 변경 모달
function ChangePasswordModal({ id, closeModal }) {
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [notice, setNotice] = useState(<br />);

  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const onChangeCheckPassword = (e) => {
    setCheckPassword(e.target.value);

    if (password === e.target.value) {
      setNotice(<p style={{ color: "blue" }}>비밀번호 일치</p>);
    } else {
      setNotice(<p style={{ color: "red" }}>비밀번호 불일치</p>);
    }
  };

  const onClickHandler = (e) => {
    e.preventDefault();

    if (password === checkPassword) {
      axios
        .post(`${url}/api/newPassword`, {
          userId: id,
          newPassword: password,
        })
        .then((response) => {
          console.log(response);
          alert("변경되었습니다.");
          window.location.reload();
        })
        .catch((error) => {
          console.log(error);
          alert("올바르지 않습니다.");
        });
    }
  };

  return (
    <div className="modal_L2">
      <div className="modal-content_L2">
        <span className="close_L" onClick={closeModal}>
          &times;
        </span>
        <h2>비밀번호 변경</h2>
        <input type="password" value={password} onChange={onChangePassword} />
        <input
          type="password"
          value={checkPassword}
          onChange={onChangeCheckPassword}
        />
        <div className="ALERT_RIGHT">{notice}</div>
        <button className="CHANGE_BUTTON" onClick={onClickHandler}>
          비밀번호
          <br />
          바꾸기
        </button>
      </div>
    </div>
  );
}

// 이메일 인증 모달
function Verify(props) {
  const [verifyNum, setVerifyNum] = useState("");
  const [verifyNotice, setVerifyNotice] = useState(<br />);
  const [change, setChange] = useState(<br />);

  const onChangeVerifyNum = (e) => {
    setVerifyNum(e.target.value);
  };

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const onClickVerify = (e) => {
    e.preventDefault();

    if (verifyNum === String(props.realVerify)) {
      setShowChangePasswordModal(true);
      // 이 부분에 추가.
    } else {
      alert("번호 틀림");
      // setVerifyNum("");
    }
  };

  return (
    <div>
      <input
        className="VERIFYFORM"
        placeholder="인증번호"
        type="text"
        value={verifyNum}
        onChange={onChangeVerifyNum}
      ></input>
      <button
        className="VERIFYFORM_BUTTON"
        type="button"
        value="인증"
        onClick={onClickVerify}
      >
        인증
      </button>
      {verifyNotice}
      {change}
      {showChangePasswordModal && (
        <ChangePasswordModal
          id={props.id}
          closeModal={() => setShowChangePasswordModal(false)}
        />
      )}
    </div>
  );
}

// 비밀번호 찾기 모달
function Modal({ closeModal }) {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [verify, setVerify] = useState(null);

  const onChangeId = (e) => {
    setId(e.target.value);
  };

  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const onClickHandler = (e) => {
    e.preventDefault();

    axios
      .post(`${url}/api/passwordFind`, {
        userId: id,
        email: email,
      })
      .then((response) => {
        console.log(response);
        setSendEmail(true);

        const realVerify = response.data;
        setVerify(<Verify realVerify={realVerify} id={id} />);
      })
      .catch((error) => {
        alert("입력하신 정보가 올바르지 않습니다.");
        console.log(error);
      });
  };

  return (
    <div className="modal_L">
      <div className="modal-content_L">
        <span className="close_L" onClick={closeModal}>
          &times;
        </span>
        <h2>비밀번호 찾기</h2>
        <input
          type="text"
          value={id}
          onChange={onChangeId}
          disabled={sendEmail}
          placeholder="아이디"
        ></input>{" "}
        <input
          type="email"
          value={email}
          onChange={onChangeEmail}
          placeholder="이메일"
          disabled={sendEmail}
        ></input>{" "}
        {verify}
        {!sendEmail && (
          <button className="verifyButton" onClick={onClickHandler}>
            확인{" "}
          </button>
        )}
      </div>
    </div>
  );
}

// 여기가 메인임
function Login({ handleLogin }) {
  const [userId, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [verify, setVerify] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate(); // useNavigate 훅을 사용해 navigate 함수 가져오기

  const handleClearUsername = () => {
    setUsername(""); // 아이디 상태값을 빈 문자열("")로 업데이트
  };

  const handleToggleShowPassword = () => {
    // 비밀번호 보이기 여부 상태값 토글
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleForgotPasswordClick = () => {
    setShowModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const data = {
      userId: userId, // 입력된 아이디
      password: password, // 입력된 비밀번호
    };

    axios
      .post(`${url}/api/login`, data)
      .then((response) => {
        if (response.data) {
          // 로그인 성공
          const token = response.data; // 서버에서 전달된 토큰
          localStorage.setItem("token", token); // 토큰을 LocalStorage에 저장
          setError("");
          // alert("로그인 성공!");
          console.log(token);

          handleLogin(); // 로그인 정보를 상태로 관리하는 함수 호출

          navigate("/layout/my_calendar"); // /layout 경로로 이동
        } else {
          // 로그인 실패
          setError("아이디 또는 비밀번호가 잘못되었습니다.");
          alert("아이디 또는 비밀번호가 잘못되었습니다.");
        }
      })
      .catch((error) => {
        console.log(error);
        // 요청이 실패한 경우 (예: 401 Unauthorized)
        setError("서버 오류가 발생했습니다.");
        alert("아이디 또는 비밀번호가 잘못되었습니다.");
      });

    const closeModal = () => {
      setShowModal(false);
    };
  };

  // 비밀번호 찾기
  const onModalSubmit = (userInputVerificationCode) => {
    if (userInputVerificationCode === verificationCode) {
      alert("인증 성공!");

      axios
        .post(`${url}/api/passwordFind`, null, {
          userId: userId,
          email: email,
        })
        .then((response) => {
          console.log(response);
          setSendEmail(true);

          const realVerify = response.data;
          setVerify(<Verify realVerify={realVerify} id={id} />);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    const onChangeId = (e) => {
      setId(e.target.value);
    };

    const onChangeEmail = (e) => {
      setEmail(e.target.value);
    };
  };

  return (
    // 여기서 부터 HTML
    <div className="LOGIN_CONTAIN">
      <div className="LOGIN_FORM">
        <form onSubmit={handleFormSubmit}>
          <div>
            <div className="LOGIN_FORM_WRAPPER">
              <svg
                className="X_ICON"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                onClick={handleClearUsername}
              >
                <rect
                  x="3.5"
                  y="3.5"
                  width="17.5"
                  height="17.5"
                  rx="8.75"
                  stroke="#667085"
                />
                <path
                  d="M14.7946 10.0021L10.0026 14.7941"
                  stroke="#667085"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.796 14.797L10 10"
                  stroke="#667085"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <input
                className="LOGIN_FORM_L"
                type="text"
                placeholder="아이디"
                value={userId}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="PASSWORD_FORM_WRAPPER">
              <svg
                className="EYES_ICON"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                onClick={handleToggleShowPassword}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.5114 14.0663C10.9846 14.0663 9.74624 12.8286 9.74624 11.3011C9.74624 10.5272 10.0631 9.82955 10.5754 9.32693C10.7656 9.14031 10.7686 8.83483 10.5819 8.6446C10.3953 8.45438 10.0898 8.45145 9.89962 8.63807C9.21011 9.31449 8.78125 10.2573 8.78125 11.3011C8.78125 13.3617 10.4519 15.0312 12.5114 15.0312C13.5542 15.0312 14.498 14.6024 15.1744 13.9129C15.361 13.7227 15.3581 13.4172 15.1679 13.2306C14.9777 13.0439 14.6722 13.0469 14.4856 13.2371C13.983 13.7494 13.2845 14.0663 12.5114 14.0663Z"
                  fill="#677185"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.86113 15.2958C6.41187 17.2002 8.87407 19.1562 12.4278 19.1562C14.838 19.1562 16.7565 18.2541 18.2279 17.0769C18.4338 16.9122 18.4662 16.6131 18.3003 16.4087C18.1344 16.2044 17.833 16.1723 17.6272 16.3369C16.2908 17.406 14.5783 18.2059 12.4278 18.2059C9.27031 18.2059 7.05482 16.478 5.60568 14.6984C4.88217 13.8099 4.35932 12.9191 4.01741 12.2496C3.84675 11.9154 3.72195 11.6379 3.64038 11.4455C3.62008 11.3976 3.60248 11.355 3.58752 11.3182C3.62404 11.2328 3.67542 11.1166 3.74195 10.9749C3.89472 10.6497 4.12678 10.1915 4.44151 9.66599C5.07304 8.61151 6.02699 7.30344 7.32593 6.24933C7.53061 6.08323 7.56089 5.78387 7.39356 5.58069C7.22623 5.37751 6.92466 5.34745 6.71998 5.51355C5.30516 6.66169 4.28386 8.06949 3.61858 9.18033C3.2849 9.73747 3.03816 10.2243 2.87423 10.5734C2.79221 10.748 2.73078 10.8885 2.68943 10.9864C2.66875 11.0353 2.65309 11.0737 2.64237 11.1003C2.63701 11.1137 2.63289 11.1241 2.62999 11.1315L2.62657 11.1402L2.62555 11.1429L2.62521 11.1438L2.62509 11.1441C2.62504 11.1442 2.62499 11.1443 3.07244 11.3132C2.62151 11.4726 2.62158 11.4729 2.62167 11.4731L2.62188 11.4737L2.6225 11.4754L2.62448 11.4808C2.62613 11.4853 2.62843 11.4916 2.63141 11.4995C2.63735 11.5154 2.64595 11.5381 2.65725 11.5672C2.67986 11.6253 2.71331 11.7088 2.75795 11.8141C2.84719 12.0246 2.9814 12.3227 3.16349 12.6793C3.52708 13.3912 4.08471 14.3424 4.86113 15.2958ZM3.07244 11.3132L2.62151 11.4726C2.58333 11.3663 2.58457 11.2499 2.62499 11.1443L3.07244 11.3132Z"
                  fill="#677185"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.8437 15.599C19.0391 15.772 19.3392 15.7556 19.5141 15.5624C20.4324 14.5478 21.0912 13.4913 21.5202 12.6906C21.7352 12.2895 21.8935 11.9506 21.9987 11.7104C22.0513 11.5902 22.0907 11.4946 22.1172 11.428C22.1305 11.3948 22.1406 11.3687 22.1476 11.3506C22.1511 11.3415 22.1538 11.3343 22.1557 11.3292L22.158 11.3231L22.1587 11.3211L22.1589 11.3205L22.159 11.3202C22.1591 11.3201 22.1591 11.32 21.7128 11.16C22.1566 10.9932 22.1565 10.993 22.1564 10.9928L22.1555 10.9906L22.1535 10.9853C22.1517 10.9808 22.1493 10.9747 22.1462 10.9668C22.1399 10.9511 22.1308 10.9286 22.1189 10.8997C22.0951 10.8421 22.0599 10.7591 22.0131 10.6544C21.9195 10.4451 21.7795 10.1485 21.5911 9.79371C21.2149 9.08521 20.6431 8.13866 19.8603 7.18977C18.2995 5.29764 15.853 3.34375 12.4131 3.34375C10.8616 3.34375 9.50706 3.74313 8.34492 4.35717C8.11365 4.47936 8.02631 4.76388 8.14983 4.99266C8.27336 5.22143 8.56097 5.30784 8.79224 5.18564C9.83116 4.63672 11.0332 4.283 12.4131 4.283C15.4521 4.283 17.6554 6.00241 19.1247 7.78359C19.857 8.67135 20.3953 9.56145 20.7505 10.2304C20.9278 10.5644 21.0587 10.8418 21.1447 11.0342C21.1665 11.0829 21.1854 11.1262 21.2014 11.1635C21.1814 11.2118 21.1568 11.27 21.1274 11.337C21.0308 11.5578 20.8831 11.8742 20.6813 12.2507C20.277 13.0054 19.6596 13.9934 18.8067 14.9359C18.6318 15.1291 18.6484 15.426 18.8437 15.599ZM21.7128 11.16L22.1566 10.9932C22.1969 11.0983 22.1978 11.2143 22.1591 11.32L21.7128 11.16Z"
                  fill="#677185"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.4279 12.2744C15.6747 12.3191 15.9085 12.1399 15.95 11.8741C15.9819 11.6703 16 11.4594 16 11.242C16 9.15868 14.4318 7.46875 12.4963 7.46875C12.2944 7.46875 12.0986 7.48825 11.9093 7.52255C11.6625 7.56729 11.4961 7.81905 11.5376 8.08487C11.5792 8.35069 11.8129 8.5299 12.0598 8.48516C12.2034 8.45913 12.3488 8.4449 12.4963 8.4449C13.931 8.4449 15.0936 9.69762 15.0936 11.242C15.0936 11.4008 15.0804 11.5574 15.0562 11.7121C15.0146 11.9779 15.1811 12.2297 15.4279 12.2744Z"
                  fill="#677185"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.78125 11.3011C8.78125 13.3616 10.4509 15.0312 12.5114 15.0312C13.5552 15.0312 14.498 14.6024 15.1744 13.9129C15.361 13.7227 15.3581 13.4172 15.1679 13.2306C14.9777 13.0439 14.6722 13.0469 14.4856 13.2371C13.983 13.7494 13.2853 14.0663 12.5114 14.0663C10.9839 14.0663 9.74624 12.8286 9.74624 11.3011C9.74624 10.528 10.0631 9.8295 10.5754 9.32693C10.7656 9.14031 10.7686 8.83483 10.5819 8.6446C10.3953 8.45438 10.0898 8.45145 9.89962 8.63807C9.21006 9.31454 8.78125 10.2583 8.78125 11.3011Z"
                  fill="#677185"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M20.6749 19.3624C20.8584 19.1789 20.8584 18.8814 20.6749 18.6978L5.11465 3.13763C4.93115 2.95412 4.63363 2.95412 4.45013 3.13763C4.26662 3.32113 4.26662 3.61865 4.45013 3.80215L20.0103 19.3624C20.1939 19.5459 20.4914 19.5459 20.6749 19.3624Z"
                  fill="#677185"
                />
              </svg>
              <input
                className="PASSWORD_FORM_L"
                type={showPassword ? "text" : "password"} // 비밀번호 보이기 여부에 따라 동적으로 type 변경
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="PASSWORD_FIND">
            <span onClick={handleForgotPasswordClick}>
              비밀번호를 잊으셨나요?
            </span>
          </div>

          <button className="LOGIN_BUTTON" type="submit">
            로그인
          </button>
        </form>
        {showModal && <Modal closeModal={() => setShowModal(false)} />}
      </div>
    </div>
  );
}

export default Login;
