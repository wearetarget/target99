<?php
if (function_exists('zip_open') && strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
    class N2ZipReader {

        public static function read($path) {
            $zip = zip_open($path);
            if (!is_resource($zip)) {
                return array();
            }
            $data = array();
            while ($entry = zip_read($zip)) {

                zip_entry_open($zip, $entry, "r");

                self::recursiveRead($data, explode('/', zip_entry_name($entry)), zip_entry_read($entry, zip_entry_filesize($entry)));

                zip_entry_close($entry);
            }

            zip_close($zip);

            return $data;
        }

        private static function recursiveRead(&$data, $parts, $content) {
            if (count($parts) == 1) {
                $data[$parts[0]] = $content;
            } else {
                if (!isset($data[$parts[0]])) {
                    $data[$parts[0]] = array();
                }
                self::recursiveRead($data[array_shift($parts)], $parts, $content);
            }
        }
    }
} else {
    class N2ZipReader {

        public static function read($path) {
            $files = array();

            $size = filesize($path);

            // Read file
            $fh   = fopen($path, "rb");
            $data = fread($fh, $size);
            fclose($fh);

            // Break into sections
            $filesecta = explode("\x50\x4b\x05\x06", $data);

            // ZIP Comment
            $unpackeda = unpack('x16/v1length', $filesecta[1]);

            // Cut entries from the central directory
            $filesecta = explode("\x50\x4b\x01\x02", $data);
            $filesecta = explode("\x50\x4b\x03\x04", $filesecta[0]);
            array_shift($filesecta); // Removes empty entry/signature

            foreach ($filesecta as $data) {
                $unpackeda = unpack("v1version/v1general_purpose/v1compress_method/v1file_time/v1file_date/V1crc/V1size_compressed/V1size_uncompressed/v1filename_length", $data);

                // Check for encryption
                $isEncrypted = (($unpackeda['general_purpose'] & 0x0001) ? true : false);

                // Check for value block after compressed data
                if ($unpackeda['general_purpose'] & 0x0008) {
                    $unpackeda2 = unpack("V1crc/V1size_compressed/V1size_uncompressed", substr($data, -12));

                    $unpackeda['crc']               = $unpackeda2['crc'];
                    $unpackeda['size_compressed']   = $unpackeda2['size_uncompressed'];
                    $unpackeda['size_uncompressed'] = $unpackeda2['size_uncompressed'];

                    unset($unpackeda2);
                }

                $error = "";
                $path  = substr($data, 26, $unpackeda['filename_length']);

                if (substr($path, -1) == "/") // skip directories
                {
                    continue;
                }

                $dir  = dirname($path);
                $dir  = ($dir == "." ? "" : $dir);
                $path = basename($path);

                $data = substr($data, 26 + $unpackeda['filename_length']);

                if (strlen($data) != $unpackeda['size_compressed']) {
                    $error = "Compressed size is not equal to the value given in header.";
                }

                if ($isEncrypted) {
                    $error = "Encryption is not supported.";
                } else {
                    switch ($unpackeda['compress_method']) {
                        case 0: // Stored
                            // Not compressed, continue
                            break;
                        case 8: // Deflated
                            $data = gzinflate($data);
                            break;
                        case 12: // BZIP2

                            if (extension_loaded("bz2")) {
                                $data = bzdecompress($data);
                            } else {
                                $error = "Required BZIP2 Extension not available.";
                            }
                            break;
                        default:
                            $error = "Compression method ({$unpackeda['compress_method']}) not supported.";
                    }

                    if (!$error) {
                        if ($data === false) {
                            $error = "Decompression failed.";
                        } elseif (strlen($data) != $unpackeda['size_uncompressed']) {
                            $error = "File size is not equal to the value given in header.";
                        } elseif (crc32($data) != $unpackeda['crc']) {
                            $error = "CRC32 checksum is not equal to the value given in header.";
                        }
                    }
                }

                if (!empty($error)) {
                    throw new Exception($error);
                }

                if (!empty($dir)) {
                    if (!isset($files[$dir])) {
                        $files[$dir] = array();
                    }
                    $files[$dir][$path] = $data;
                } else {
                    $files[$path] = $data;
                }
            }

            return $files;
        }
    }
}