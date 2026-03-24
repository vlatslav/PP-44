import {CSSProperties, FC} from 'react'
import "./AlertMessage.scss"
import {Alert, Snackbar} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SUCCESS_CODE = 200
const INFO_ALERT = "info"

interface AlertMessageProps {
  code: number | null,
  message: string,
  setMessage: (message: string | null) => void;
  style?: CSSProperties,
  type?: string,
  duration: number
}

const AlertMessage: FC<AlertMessageProps> = ({code, message, setMessage, style, type, duration}) => {
  const successIcon = <CheckCircleIcon fontSize="inherit" />

  return (
      <div>
        <Snackbar
            anchorOrigin={{ horizontal:"center", vertical:"top" }}
            open={!!message}
            autoHideDuration={duration || 5000}
            onClose={() => setMessage(null)}
        >
          <Alert
              className={type === INFO_ALERT ? "info-alert-message" : "custom-alert-message"}
              style={{
                ...style
              }}
              variant="filled"
              severity={code === SUCCESS_CODE ? "success" : "error"}
              iconMapping={{
                success: successIcon
              }}
          >
            <span className="t-s3">{message}</span>
          </Alert>
        </Snackbar>
      </div>
  )
}

export default AlertMessage