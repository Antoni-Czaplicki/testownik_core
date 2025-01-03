const trueFalseStrings = {
    "prawda": true, "tak": true, "true": true,
    "fałsz": false, "nie": false, "false": false
};

let questions = [];
let questionSet = new Set();
let index = 1;

let directoryFiles = [];

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const fileBox = document.getElementById('file-box');

    fileInput.addEventListener('change', handleFileSelect);
    fileBox.addEventListener('dragover', handleDragOverFile);
    fileBox.addEventListener('dragleave', handleDragLeaveFile);
    fileBox.addEventListener('drop', handleFileDrop);

    const directoryInput = document.getElementById('directory-input');
    const directoryBox = document.getElementById('directory-box');

    directoryInput.addEventListener('change', handleDirectorySelect);
    directoryBox.addEventListener('dragover', handleDragOverDirectory);
    directoryBox.addEventListener('dragleave', handleDragLeaveDirectory);
    directoryBox.addEventListener('drop', handleDirectoryDrop);

    document.getElementById('import-button').addEventListener('click', async () => {
        let data
        try {
            data = await importQuiz()
        } catch (error) {
            showError('import-error', error.message);
            return;
        }
        fetch('/quizzes/import/',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(data)
            }
        ).then(response => {
            if (response.ok) {
                response.json().then(data =>
                    window.location.href = `/quizzes/${data.id}/`
                );
            } else {
                response.json().then(data => {
                    showError('import-error', data.error);
                });
            }
        });

    });

    function handleFileSelect(evt) {
        const file = evt.target.files[0];
        const name = document.getElementById('file-name');
        if (file) {
            document.getElementById('file-box').classList.add('has-name');
            name.textContent = file.name;
            name.style.display = 'inline';
            directoryInput.value = '';
            directoryFiles = [];
            const directoryName = document.getElementById('directory-name');
            directoryName.textContent = '';
            directoryName.style.display = 'none';
        } else {
            document.getElementById('file-box').classList.remove('has-name');
            name.style.display = 'none';
        }
        handleDragLeaveFile();
    }

    function handleDirectorySelect(evt) {
        directoryFiles = evt.target.files;
        const directoryPath = directoryFiles[0].webkitRelativePath;
        const directoryName = directoryPath.split('/')[0];
        const name = document.getElementById('directory-name');
        if (directoryFiles) {
            document.getElementById('directory-box').classList.add('has-name');
            name.textContent = directoryName;
            name.style.display = 'inline';
            fileInput.value = '';
            const fileName = document.getElementById('file-name');
            fileName.textContent = '';
            fileName.style.display = 'none';
            document.getElementById('file-box').classList.remove('has-name');
        } else {
            document.getElementById('directory-box').classList.remove('has-name');
            name.style.display = 'none';
        }
        handleDragLeaveDirectory();
    }

    function handleFileDrop(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        const file = evt.dataTransfer.files[0];
        if (file) {
            fileInput.files = evt.dataTransfer.files;
            handleFileSelect({target: {files: [file]}});
        }
    }

    function handleDirectoryDrop(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        const directory = evt.dataTransfer.items[0].webkitGetAsEntry();
        if (directory && directory.isDirectory) {
            const name = document.getElementById('directory-name');
            directoryFiles = [];
            const reader = directory.createReader();
            const readEntries = () => {
                reader.readEntries(entries => {
                    if (entries.length) {
                        directoryFiles = directoryFiles.concat(entries);
                        readEntries();
                    }
                });
            }
            readEntries();
            if (directoryFiles) {
                document.getElementById('directory-box').classList.add('has-name');
                name.textContent = directory.name;
                name.style.display = 'inline';
                fileInput.value = '';
                const fileName = document.getElementById('file-name');
                fileName.textContent = '';
                fileName.style.display = 'none';
                document.getElementById('file-box').classList.remove('has-name');
            } else {
                document.getElementById('directory-box').classList.remove('has-name');
                name.style.display = 'none';
            }
        } else {
            document.getElementById('directory-box').classList.remove('has-name');
            name.style.display = 'none';
        }
        handleDragLeaveDirectory();
    }

    function handleDragOverFile(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (evt.dataTransfer.items && evt.dataTransfer.items.length === 1 && evt.dataTransfer.items[0].kind === 'file' && ['application/zip', 'application/zip-compressed', 'application/x-zip-compressed', 'multipart/x-zip'].includes(evt.dataTransfer.items[0].type)) {
            evt.dataTransfer.dropEffect = 'copy';
            if (document.getElementById('file-name').style.display === 'none') {
                document.getElementById('file-cta').classList.add('dragover');
            } else {
                fileBox.classList.add('dragover');
            }
        } else {
            evt.dataTransfer.dropEffect = 'none';
        }
    }

    function handleDragOverDirectory(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (evt.dataTransfer.items && evt.dataTransfer.items.length === 1) {
            evt.dataTransfer.dropEffect = 'copy';
            if (document.getElementById('directory-name').style.display === 'none') {
                document.getElementById('directory-cta').classList.add('dragover');
            } else {
                directoryBox.classList.add('dragover');
            }
        } else {
            evt.dataTransfer.dropEffect = 'none';
        }
    }

    function handleDragLeaveFile(evt) {
        if (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }
        fileBox.classList.remove('dragover');
        document.getElementById('file-cta').classList.remove('dragover');
    }

    function handleDragLeaveDirectory(evt) {
        if (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }
        directoryBox.classList.remove('dragover');
        document.getElementById('directory-cta').classList.remove('dragover');
    }

    async function importQuiz() {
        let title = document.getElementById('title').value;
        if (title === '') {
            throw new Error('Nie podano nazwy bazy.');
        }
        await processFiles();
        return {
            "type": "json",
            "data": {
                "title": title,
                "description": document.getElementById('description').value || null,
                "questions": questions
            }
        };
    }

    function showError(id, message) {
        const help = document.getElementById(id);
        help.textContent = message;
        help.style.display = 'block';
        help.classList.add('is-danger');
    }

    async function processFiles() {
        const zipInput = document.getElementById('file-input');

        if (directoryFiles.length > 0) {
            await processDirectory(directoryFiles);
        } else if (zipInput.files.length > 0) {
            await processZip(zipInput.files[0]);
        } else {
            throw new Error('Nie wybrano pliku ani folderu.');
        }
    }


    async function processDirectory(files) {
        for (const file of files) {
            if (file.name.endsWith('.txt')) {
                const lines = await readFile(file);
                await processQuestion(lines, file.name);
            }
        }
    }

    async function processZip(file) {
        const zip = await JSZip.loadAsync(file);
        for (const file in zip.files) {
            if (file.endsWith('.txt')) {
                const content = await zip.file(file).async('uint8array');
                let lines;
                try {
                    const decoder = new TextDecoder('utf-8', {fatal: true});
                    lines = decoder.decode(content).split('\n').map(line => line.trim());
                } catch (e) {
                    const decoder = new TextDecoder('windows-1250');
                    lines = decoder.decode(content).split('\n').map(line => line.trim());
                }
                await processQuestion(lines, file);
            }
        }
    }

    async function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split('\n').map(line => line.trim()));
            reader.onerror = reject;
            if (file instanceof File) {
                detectEncodingAndReadFile(file, reader);
            } else if (file.isFile) {
                file.file(file => {
                    detectEncodingAndReadFile(file, reader);
                });
            }
        });
    }

    function detectEncodingAndReadFile(file, reader) {
        const reader2 = new FileReader();
        reader2.onload = () => {
            const decoder = new TextDecoder('utf-8');
            const utf8 = decoder.decode(reader2.result);
            if (utf8 !== reader2.result) {
                reader.readAsText(file, 'windows-1250');
            } else {
                reader.readAsText(file);
            }
        };
        reader2.readAsArrayBuffer(file);
    }

    async function processQuestion(lines, path) {
        let filename = path.replace(/^.*[\\/]/, '')
        const template = lines[0].trim();
        if (template === '') {
            console.error(`Error in file ${path}. Template not found. Skipping.`);
            return;
        } else if (!["x", "y"].includes(template[0].toLowerCase())) {
            console.error(`Error in file ${path}. Template not recognized. Skipping.`);
            return
        } else if ([...template.slice(1)].some(c => c !== '0' && c !== '1')) {
            return;
        }

        let question = lines[1].trim();

        // Extract number from filename
        const filenameNumberMatch = filename.match(/^0*(\d+)/);
        if (filenameNumberMatch) {
            const filenameNumber = filenameNumberMatch[1];
            // Remove the number from the beginning of the question if it matches the filename number
            const questionNumberMatch = question.match(/^0*(\d+)\.\s*(0*\d+\.\s*)?(.*)/);
            if (questionNumberMatch && questionNumberMatch[1] === filenameNumber) {
                question = questionNumberMatch[3];
            }
        }

        const answers = [];

        for (let s = 2; s < Math.min(lines.length, template.length + 1); s++) {
            if (lines[s] === undefined || lines[s].trim() === '') {
                continue;
            }
            try {
                answers.push({
                    "answer": lines[s].trim(),
                    "correct": template[s - 1] === '1'
                });
            } catch (error) {
                console.error(`Error in file ${path} at line ${s}. Replacing the unknown value with False.`);
                answers.push({
                    "answer": lines[s].trim(),
                    "correct": false
                });
            }
        }

        const isTrueFalse = (template === "X01" || template === "X10") &&
            trueFalseStrings[answers[0].answer.toLowerCase()] !== undefined &&
            trueFalseStrings[answers[1].answer.toLowerCase()] !== undefined;

        const questionObj = {
            "question": question,
            "answers": answers,
            "multiple": !isTrueFalse,
            "explanation": null,
            "id": index++
        };

        const questionStr = JSON.stringify({
            "question": questionObj.question,
            "answers": answers.sort((a, b) => a.answer.localeCompare(b.answer))
        }).toLowerCase();

        if (!questionSet.has(questionStr)) {
            questions.push(questionObj);
            questionSet.add(questionStr);
        } else {
            console.log(`Duplicate question in file ${path}. Skipping.`);
        }
    }

});