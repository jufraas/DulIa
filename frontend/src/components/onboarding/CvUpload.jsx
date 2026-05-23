import { CV_ACCEPT, CV_MAX_SIZE_MB } from '../../constants/onboardingOptions'
import FileInput from '../ui/FileInput'

/**
 * @owner migue
 * Upload de CV en PDF (opcional). Máx 5 MB.
 *
 * @param {{ file: File | null, onChange: (file: File | null) => void, error?: string }} props
 */
export default function CvUpload({ file, onChange, error }) {
  return (
    <FileInput
      label="CV en PDF (opcional)"
      name="cv"
      accept={CV_ACCEPT}
      file={file}
      onChange={onChange}
      error={error}
      hint={`PDF, máximo ${CV_MAX_SIZE_MB} MB. Mejora el análisis con MarkItDown.`}
      maxSizeMb={CV_MAX_SIZE_MB}
    />
  )
}
