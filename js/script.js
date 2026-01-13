/* 
欢迎关注公众号**信息科技云课堂**，获取最新动态和使用帮助。
如有问题或建议，欢迎通过以下方式联系：
- **GitHub**：[GitHub Repository](https://github.com/PythonHome-cn)
- **Gitee**：[Gitee Repository](https://gitee.com/KwokChung)
- **微信公众号**：[Markdown编辑器 v2.0](https://mp.weixin.qq.com/s/hhS3LLsCae-sLHkCAcXfsw) 
*/

class MarkdownEditor {
    constructor() {
        this.initElements();
        this.initState();
        this.initEasyMDE();
        this.initEventListeners();
        this.loadFromLocalStorage();
        this.loadTheme();
        this.loadPreviewTheme();
        this.initThemeCssMap();
    }

    initElements() {
        this.previewOutput = document.getElementById('preview-output');
        this.wordCount = document.getElementById('word-count');
        this.saveStatus = document.getElementById('save-status');
        this.autosaveStatus = document.getElementById('autosave-status');
        this.cursorPosition = document.getElementById('cursor-position');
        this.lineCount = document.getElementById('line-count');
        this.exportModal = document.getElementById('export-modal');
        this.cssSidebar = document.getElementById('css-sidebar');
        this.customThemeName = document.getElementById('custom-theme-name');
        this.customThemeCss = document.getElementById('custom-theme-css');
        this.btnSave = document.getElementById('btn-save');
        this.btnImport = document.getElementById('btn-import');
        this.btnExport = document.getElementById('btn-export');
        this.btnTheme = document.getElementById('btn-theme');
        this.btnClear = document.getElementById('btn-clear');
        this.fileInput = document.getElementById('file-input');
        this.previewTheme = document.getElementById('preview-theme');
        this.closeSidebar = document.getElementById('close-sidebar');
        this.customThemeDelete = document.getElementById('custom-theme-delete');
        this.customThemeCancel = document.getElementById('custom-theme-cancel');
        this.customThemeSave = document.getElementById('custom-theme-save');
        this.exportMd = document.getElementById('export-md');
        this.exportHtml = document.getElementById('export-html');
        this.exportPdf = document.getElementById('export-pdf');
        this.closeExport = document.getElementById('close-export');
        this.toggleCssEditor = document.getElementById('toggle-css-editor');
        this.btnBold = document.getElementById('btn-bold');
        this.btnItalic = document.getElementById('btn-italic');
        this.btnStrikethrough = document.getElementById('btn-strikethrough');
        this.btnHeading = document.getElementById('btn-heading');
        this.btnQuote = document.getElementById('btn-quote');
        this.btnUnorderedList = document.getElementById('btn-unordered-list');
        this.btnOrderedList = document.getElementById('btn-ordered-list');
        this.btnChecklist = document.getElementById('btn-checklist');
        this.btnLink = document.getElementById('btn-link');
        this.btnImage = document.getElementById('btn-image');
        this.btnTable = document.getElementById('btn-table');
        this.btnCode = document.getElementById('btn-code');
    }

    initState() {
        this.customThemes = {};
        this.autoSaveTimer = null;
        this.lastSavedContent = '';
    }

    initEasyMDE() {
        if (typeof EasyMDE === 'undefined') {
            console.error('EasyMDE not loaded');
            return;
        }

        this.easyMDE = new EasyMDE({
            element: document.getElementById('markdown-input'),
            spellChecker: false,
            status: ['lines', 'words', 'cursor'],
            lineNumbers: true,
            toolbar: false,
            placeholder: '在此输入 Markdown 内容...',
            previewClass: 'editor-preview',
            renderingConfig: {
                codeSyntaxHighlighting: false,
                markedOptions: {
                breaks: true,
                gfm: true,
                tables: true,
            },
        },
        });

        setTimeout(() => {
            const scroller = this.easyMDE.codemirror.getScrollerElement();
            if (scroller) {
                scroller.style.overflowY = 'auto';
                scroller.style.overflowX = 'auto';
                scroller.style.height = '100%';
                scroller.style.minHeight = 'auto';
            }

            this.easyMDE.codemirror.setOption('mode', 'markdown');
            this.easyMDE.codemirror.setOption('lineWrapping', true);
        }, 100);

        // 监听内容变化
        this.easyMDE.codemirror.on('change', () => {
            this.updatePreview();
            this.updateWordCount();
            this.updateLineCount();
            this.checkSaveStatus();
        });

        // 监听光标位置变化
        this.easyMDE.codemirror.on('cursorActivity', () => {
            this.updateCursorPosition();
        });

        // 同步滚动
        this.initSyncScroll();
    }

    initEventListeners() {
        if (this.btnSave) this.btnSave.addEventListener('click', () => this.save());
        if (this.btnImport && this.fileInput) this.btnImport.addEventListener('click', () => this.fileInput.click());
        if (this.fileInput) this.fileInput.addEventListener('change', (e) => this.importFile(e.target.files[0]));
        if (this.btnExport) this.btnExport.addEventListener('click', () => this.openExportModal());
        if (this.btnTheme) this.btnTheme.addEventListener('click', () => this.toggleTheme());
        if (this.btnClear) this.btnClear.addEventListener('click', () => this.clear());
        if (this.toggleCssEditor) this.toggleCssEditor.addEventListener('click', () => this.openCssSidebar());
        if (this.closeSidebar) this.closeSidebar.addEventListener('click', () => this.closeCssSidebar());
        if (this.customThemeCancel) this.customThemeCancel.addEventListener('click', () => this.closeCssSidebar());
        if (this.customThemeSave) this.customThemeSave.addEventListener('click', () => this.saveCustomTheme());
        if (this.customThemeDelete) this.customThemeDelete.addEventListener('click', () => this.deleteCustomTheme());
        if (this.exportMd) this.exportMd.addEventListener('click', () => this.exportAsMd());
        if (this.exportHtml) this.exportHtml.addEventListener('click', () => this.exportAsHtml());
        if (this.exportPdf) this.exportPdf.addEventListener('click', () => this.exportAsPdf());
        if (this.closeExport) this.closeExport.addEventListener('click', () => this.closeExportModal());

        if (this.btnBold) this.btnBold.addEventListener('click', () => this.easyMDE.toggleBold());
        if (this.btnItalic) this.btnItalic.addEventListener('click', () => this.easyMDE.toggleItalic());
        if (this.btnStrikethrough) this.btnStrikethrough.addEventListener('click', () => this.easyMDE.toggleStrikethrough());
        if (this.btnHeading) this.btnHeading.addEventListener('click', () => this.easyMDE.toggleHeadingSmaller());
        if (this.btnQuote) this.btnQuote.addEventListener('click', () => this.easyMDE.toggleBlockquote());
        if (this.btnUnorderedList) this.btnUnorderedList.addEventListener('click', () => this.easyMDE.toggleUnorderedList());
        if (this.btnOrderedList) this.btnOrderedList.addEventListener('click', () => this.easyMDE.toggleOrderedList());
        if (this.btnChecklist) this.btnChecklist.addEventListener('click', () => this.toggleChecklist());
        if (this.btnLink) this.btnLink.addEventListener('click', () => this.easyMDE.drawLink());
        if (this.btnImage) this.btnImage.addEventListener('click', () => this.drawImage());
        if (this.btnTable) this.btnTable.addEventListener('click', () => this.easyMDE.drawTable());
        if (this.btnCode) this.btnCode.addEventListener('click', () => this.easyMDE.toggleCodeBlock());

        if (this.previewTheme) {
            this.previewTheme.addEventListener('change', (e) => {
                this.setPreviewTheme(e.target.value);
            });
        }



        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                this.save();
            }
        });

        this.startAutoSave();
    }

    toggleChecklist() {
        if (!this.easyMDE) return;
        const cm = this.easyMDE.codemirror;
        const doc = cm.getDoc();
        const cursor = doc.getCursor();
        const line = doc.getLine(cursor.line);
        
        const checkboxPattern = /^\s*-\s+\[([ x])\]\s+/;
        const match = line.match(checkboxPattern);
        
        if (match) {
            const status = match[1];
            const newStatus = status === 'x' ? ' ' : 'x';
            const newLine = line.replace(checkboxPattern, (m, s) => m.replace(s, newStatus));
            doc.replaceRange(newLine, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        } else {
            const indent = line.match(/^\s*/)[0];
            const newLine = `${indent}- [ ] `;
            doc.replaceRange(newLine, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: 0 });
        }
        
        cm.focus();
    }

    drawImage() {
        if (!this.easyMDE) return;
        
        const url = prompt('请输入图片链接:', '');
        if (!url) return;
        
        const width = prompt('请输入图片宽度 (留空则不设置):', '');
        const height = prompt('请输入图片高度 (留空则不设置):', '');
        
        let imageMarkdown = `![图片描述](${url})`;
        
        if (width || height) {
            let sizeAttr = '';
            if (width) sizeAttr += `width="${width}" `;
            if (height) sizeAttr += `height="${height}" `;
            imageMarkdown = `<img src="${url}" alt="图片描述" ${sizeAttr}/>`;
        }
        
        const cm = this.easyMDE.codemirror;
        const doc = cm.getDoc();
        const cursor = doc.getCursor();
        doc.replaceRange(imageMarkdown, cursor);
        cm.focus();
    }

    startAutoSave() {
        // 清除之前的定时器
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        // 每3秒自动保存
        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, 3000);
    }

    autoSave() {
        if (!this.easyMDE) return;
        const currentContent = this.easyMDE.value();
        
        // 只在内容变化时保存
        if (currentContent !== this.lastSavedContent) {
            this.lastSavedContent = currentContent;
            localStorage.setItem('autosave_easyMDE_markdown-editor', currentContent);
            localStorage.setItem('last-saved', new Date().toISOString());
            this.updateAutosaveStatus();
            this.checkSaveStatus();
        }
    }

    updatePreview() {
        if (!this.easyMDE || !this.previewOutput) return;
        const html = this.easyMDE.value();
        this.previewOutput.innerHTML = this.easyMDE.options.previewRender(html);
        
        if (typeof hljs !== 'undefined') {
            const codeBlocks = this.previewOutput.querySelectorAll('pre code');
            codeBlocks.forEach((block) => {
                if (!block.hasAttribute('data-highlighted')) {
                    try {
                        hljs.highlightElement(block);
                    } catch (e) {
                        console.warn('Highlight error:', e);
                    }
                }
            });
        }
    }

    updateWordCount() {
        if (!this.easyMDE || !this.wordCount) return;
        const text = this.easyMDE.value().trim();
        const count = text ? text.split(/\s+/).length : 0;
        this.wordCount.textContent = `字数: ${count}`;
    }

    initSyncScroll() {
        if (!this.easyMDE || !this.previewOutput) {
            console.error('initSyncScroll: easyMDE or previewOutput not initialized');
            return;
        }

        const editorScroll = this.easyMDE.codemirror.getScrollerElement();
        const previewScroll = this.previewOutput;

        let isEditorScrolling = false;
        let isPreviewScrolling = false;

        editorScroll.addEventListener('scroll', () => {
            if (!isPreviewScrolling) {
                isEditorScrolling = true;
                const scrollPercentage = editorScroll.scrollTop / (editorScroll.scrollHeight - editorScroll.clientHeight);
                previewScroll.scrollTop = scrollPercentage * (previewScroll.scrollHeight - previewScroll.clientHeight);
                setTimeout(() => {
                    isEditorScrolling = false;
                }, 50);
            }
        });

        previewScroll.addEventListener('scroll', () => {
            if (!isEditorScrolling) {
                isPreviewScrolling = true;
                const scrollPercentage = previewScroll.scrollTop / (previewScroll.scrollHeight - previewScroll.clientHeight);
                editorScroll.scrollTop = scrollPercentage * (editorScroll.scrollHeight - editorScroll.clientHeight);
                setTimeout(() => {
                    isPreviewScrolling = false;
                }, 50);
            }
        });
    }

    saveToLocalStorage() {
        if (!this.easyMDE) return;
        this.lastSavedContent = this.easyMDE.value();
        localStorage.setItem('autosave_easyMDE_markdown-editor', this.easyMDE.value());
        localStorage.setItem('last-saved', new Date().toISOString());
        this.checkSaveStatus();
    }

    loadFromLocalStorage() {
        if (!this.easyMDE) return;
        const content = localStorage.getItem('autosave_easyMDE_markdown-editor');
        if (content) {
            this.easyMDE.value(content);
            this.lastSavedContent = content;
            this.checkSaveStatus();
        }
    }

    save() {
        this.saveToLocalStorage();
        alert('保存成功');
    }

    clear() {
        if (!this.easyMDE) return;
        
        // 询问用户是否确认清空
        if (confirm('确定要清空编辑器内容吗？此操作不可撤销。')) {
            // 清空编辑器内容
            this.easyMDE.value('');
            
            // 更新预览和状态
            this.updatePreview();
            this.updateWordCount();
            this.updateLineCount();
            this.saveToLocalStorage();
            
            alert('编辑器已清空');
        }
    }

    updateSaveStatus(status) {
        if (!this.saveStatus) return;
        
        if (status) {
            this.saveStatus.textContent = status;
            setTimeout(() => {
                this.checkSaveStatus();
            }, 2000);
        } else {
            this.checkSaveStatus();
        }
    }

    checkSaveStatus() {
        if (!this.saveStatus || !this.easyMDE) return;
        const currentContent = this.easyMDE.value();
        
        if (currentContent === this.lastSavedContent) {
            this.saveStatus.textContent = '已保存';
        } else {
            this.saveStatus.textContent = '未保存';
        }
    }

    updateCursorPosition() {
        if (!this.easyMDE || !this.cursorPosition) return;
        const cursor = this.easyMDE.codemirror.getCursor();
        this.cursorPosition.textContent = `行: ${cursor.line + 1}, 列: ${cursor.ch + 1}`;
    }

    updateLineCount() {
        if (!this.easyMDE || !this.lineCount) return;
        const lineCount = this.easyMDE.codemirror.lineCount();
        this.lineCount.textContent = `行数: ${lineCount}`;
    }

    updateAutosaveStatus() {
        if (!this.autosaveStatus) return;
        this.autosaveStatus.textContent = '自动保存成功';
        this.updateSaveStatus('已保存');
        setTimeout(() => {
            if (this.autosaveStatus) this.autosaveStatus.textContent = '';
        }, 3000);
    }

    importFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.easyMDE) {
                this.easyMDE.value(e.target.result);
                this.updatePreview();
                this.updateWordCount();
                this.saveToLocalStorage();
                alert('文件导入成功');
            }
        };
        reader.readAsText(file);
    }

    openExportModal() {
        if (this.exportModal) this.exportModal.style.display = 'flex';
    }

    closeExportModal() {
        if (this.exportModal) this.exportModal.style.display = 'none';
    }

    downloadFile(filename, content, mime) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    exportAsMd() {
        if (!this.easyMDE) return;
        this.downloadFile('document.md', this.easyMDE.value(), 'text/markdown');
        this.closeExportModal();
    }

    exportAsHtml() {
        if (!this.easyMDE) return;
        
        let themeClass = this.previewOutput ? this.previewOutput.className : 'preview-content';
        
        const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>导出</title><style>${this.getStylesForExport()}</style></head><body style="max-width: 1200px;margin: 0 auto;background: #F3F4F5;"><div class="${themeClass}">${this.easyMDE.options.previewRender(this.easyMDE.value())}</div></body></html>`;
        this.downloadFile('document.html', html, 'text/html');
        this.closeExportModal();
    }

    getStylesForExport() {
        let css = '';
        
        const customThemeStyle = document.getElementById('custom-theme-style');
        const realtimeStyle = document.getElementById('realtime-preview-style');
        
        if (realtimeStyle && realtimeStyle.textContent) {
            css += realtimeStyle.textContent + '\n';
        } else if (customThemeStyle && customThemeStyle.textContent) {
            css += customThemeStyle.textContent + '\n';
        } else {
            const currentTheme = localStorage.getItem('preview-theme') || 'default';
            
            if (currentTheme.startsWith('custom-')) {
                const themeName = currentTheme.replace('custom-', '');
                const customTheme = this.customThemes[themeName];
                if (customTheme && customTheme.css) {
                    css += customTheme.css + '\n';
                }
            } else if (currentTheme !== 'default' && this.themeCssMap && this.themeCssMap[currentTheme]) {
                css += this.themeCssMap[currentTheme] + '\n';
            }
        }
        
        if (this.previewOutput) {
            const computedStyle = window.getComputedStyle(this.previewOutput);
            const backgroundColor = computedStyle.backgroundColor;
            const backgroundImage = computedStyle.backgroundImage;
            const backgroundSize = computedStyle.backgroundSize;
            const backgroundPosition = computedStyle.backgroundPosition;
            const backgroundRepeat = computedStyle.backgroundRepeat;
            
            let bodyBackgroundStyles = [];
            if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
                bodyBackgroundStyles.push(`background-color: ${backgroundColor}`);
            }
            if (backgroundImage && backgroundImage !== 'none') {
                bodyBackgroundStyles.push(`background-image: ${backgroundImage}`);
            }
            if (backgroundSize) {
                bodyBackgroundStyles.push(`background-size: ${backgroundSize}`);
            }
            if (backgroundPosition) {
                bodyBackgroundStyles.push(`background-position: ${backgroundPosition}`);
            }
            if (backgroundRepeat && backgroundRepeat !== 'repeat') {
                bodyBackgroundStyles.push(`background-repeat: ${backgroundRepeat}`);
            }
            
            if (bodyBackgroundStyles.length > 0) {
                css += `body { ${bodyBackgroundStyles.join('; ')} }\n`;
            }
        }
        

        
        for (const sheet of Array.from(document.styleSheets)) {
            try {
                if (sheet.ownerNode && (sheet.ownerNode.id === 'custom-theme-style' || sheet.ownerNode.id === 'realtime-preview-style')) {
                    continue;
                }
                const rules = sheet.cssRules || [];
                for (const rule of Array.from(rules)) {
                    try { css += rule.cssText + '\n'; } catch {}
                }
            } catch {}
        }
        
        return css;
    }

    exportAsPdf() {
        if (!this.easyMDE) return;
        
        let themeClass = this.previewOutput ? this.previewOutput.className : 'preview-content';
        let bodyBackgroundStyles = '';
        
        if (this.previewOutput) {
            const computedStyle = window.getComputedStyle(this.previewOutput);
            
            const backgroundColor = computedStyle.backgroundColor;
            const backgroundImage = computedStyle.backgroundImage;
            const backgroundSize = computedStyle.backgroundSize;
            const backgroundPosition = computedStyle.backgroundPosition;
            const backgroundRepeat = computedStyle.backgroundRepeat;
            
            let styles = [];
            if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
                styles.push(`background-color: ${backgroundColor}`);
            }
            if (backgroundImage && backgroundImage !== 'none') {
                styles.push(`background-image: ${backgroundImage}`);
                if (backgroundSize) {
                    styles.push(`background-size: ${backgroundSize}`);
                }
                if (backgroundPosition) {
                    styles.push(`background-position: ${backgroundPosition}`);
                }
                if (backgroundRepeat && backgroundRepeat !== 'repeat') {
                    styles.push(`background-repeat: ${backgroundRepeat}`);
                }
            }
            
            if (styles.length > 0) {
                bodyBackgroundStyles = ` style="${styles.join('; ')}"`;
            }
        }
        
        const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>打印</title><style>${this.getStylesForExport()} @media print { body { padding: 0; margin: 0; min-height: 100vh; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }</style></head><body${bodyBackgroundStyles}><div class="${themeClass}">${this.easyMDE.options.previewRender(this.easyMDE.value())}</div></body></html>`;
        const w = window.open('', '_blank');
        if (!w) {
            alert('无法打开新窗口，请允许弹窗');
            return;
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
        
        w.onafterprint = () => {
            w.close();
        };
        
        w.print();
        
        this.closeExportModal();
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('dark-theme', isDark);
    }

    loadTheme() {
        const isDark = localStorage.getItem('dark-theme') === 'true';
        if (isDark) {
            document.body.classList.add('dark-theme');
        }
    }

    setPreviewTheme(theme) {
        if (!this.previewOutput) return;
        
        this.previewOutput.className = 'preview-content';
        
        const existingStyle = document.getElementById('custom-theme-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        if (theme.startsWith('custom-')) {
            const themeName = theme.replace('custom-', '');
            const customTheme = this.customThemes[themeName];
            
            if (customTheme) {
                this.previewOutput.classList.add(`custom-theme-${themeName}`);
                
                if (customTheme.baseTheme && customTheme.baseTheme !== 'default') {
                    this.previewOutput.classList.add(`theme-${customTheme.baseTheme}`);
                }
                
                if (customTheme.css) {
                    const styleElement = document.createElement('style');
                    styleElement.id = 'custom-theme-style';
                    styleElement.textContent = customTheme.css;
                    document.head.appendChild(styleElement);
                }
            }
        } else if (theme !== 'default') {
            this.previewOutput.classList.add(`theme-${theme}`);
        }
        
        localStorage.setItem('preview-theme', theme);
        this.updatePreview();
    }



    loadPreviewTheme() {
        this.customThemes = JSON.parse(localStorage.getItem('custom-themes') || '{}');
        
        if (this.previewTheme) {
            const currentTheme = localStorage.getItem('preview-theme') || 'default';
            
            const defaultOptions = Array.from(this.previewTheme.options).filter(opt => !opt.dataset.custom);
            this.previewTheme.innerHTML = '';
            defaultOptions.forEach(opt => this.previewTheme.appendChild(opt));
            
            Object.keys(this.customThemes).forEach(themeName => {
                const option = document.createElement('option');
                option.value = `custom-${themeName}`;
                option.textContent = `自定义: ${themeName}`;
                option.dataset.custom = 'true';
                this.previewTheme.appendChild(option);
            });
            
            this.previewTheme.value = currentTheme;
            this.setPreviewTheme(currentTheme);
        }
    }

    initThemeCssMap() {
        this.themeNameMap = {
            'default': '默认',
            'mohei': '墨黑',
            'chazi': '姹紫',
            'jinbi': '金钱蓝',
            'lvyi': '绿意',
            'hongying': '红绯',
            'lanqing': '兰青',
            'keji': '科技蓝'
        };
        
        this.themeCssMap = {
            'mohei': `.theme-mohei {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    margin: 0 auto;
    padding: 24px;
    background-color: #f8f9fa;
}

.theme-mohei h1,
.theme-mohei h2,
.theme-mohei h3 {
    font-weight: 700;
    line-height: 1.4;
    margin-top: 32px;
    margin-bottom: 16px;
    color: #212529;
}

.theme-mohei h1 {
    font-size: 2em;
    text-align: center;
    border-bottom: 2px solid #dee2e6;
    padding-bottom: 12px;
}

.theme-mohei h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 8px;
}

.theme-mohei p {
    margin-bottom: 20px;
}

.theme-mohei blockquote {
    border-left: 4px solid #dee2e6;
    padding: 16px;
    margin-bottom: 20px;
    color: #6c757d;
    background-color: #e9ecef;
    border-radius: 0 4px 4px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.theme-mohei table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid #dee2e6;
}

.theme-mohei th, .theme-mohei td {
    border: 1px solid #dee2e6;
    padding: 12px;
    text-align: left;
}

.theme-mohei th {
    background-color: #f8f9fa;
    font-weight: 600;
}

.theme-mohei tr:nth-child(even) {
    background-color: #f8f9fa;
}

.theme-mohei a {
    color: #007bff;
    text-decoration: none;
}

.theme-mohei a:hover {
    text-decoration: underline;
}

.theme-mohei img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.theme-mohei img:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.theme-mohei code {
    background-color: #e9ecef;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: #c7254e;
}

.theme-mohei code:hover {
    background-color: #dee2e6;
}

.theme-mohei pre {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 20px;
}

.theme-mohei pre code {
    background-color: transparent;
    padding: 0;
    color: #333;
}`,
            'chazi': `.theme-chazi {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    margin: 0 auto;
    padding: 24px;
    background-color: #fff;
}

.theme-chazi h1,
.theme-chazi h2,
.theme-chazi h3 {
    font-weight: 600;
    line-height: 1.4;
    margin-top: 32px;
    margin-bottom: 16px;
    color: #9c27b0;
}

.theme-chazi h1 {
    font-size: 2em;
    text-align: center;
}

.theme-chazi h2 {
    font-size: 1.5em;
    border-bottom: 2px solid #e1bee7;
    padding-bottom: 8px;
}

.theme-chazi p {
    margin-bottom: 20px;
}

.theme-chazi blockquote {
    border-left: 4px solid #9c27b0;
    padding: 16px;
    margin-bottom: 20px;
    color: #666;
    background-color: #f3e5f5;
    border-radius: 0 4px 4px 0;
    box-shadow: 0 2px 4px rgba(156,39,176,0.05);
}

.theme-chazi table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid #e1bee7;
}

.theme-chazi th, .theme-chazi td {
    border: 1px solid #e1bee7;
    padding: 12px;
    text-align: left;
}

.theme-chazi th {
    background-color: #f3e5f5;
    font-weight: 600;
}

.theme-chazi tr:nth-child(even) {
    background-color: #faf5fa;
}

.theme-chazi a {
    color: #9c27b0;
    text-decoration: none;
}

.theme-chazi a:hover {
    text-decoration: underline;
}

.theme-chazi img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(156,39,176,0.1);
}

.theme-chazi img:hover {
    box-shadow: 0 4px 12px rgba(156,39,176,0.15);
}

.theme-chazi code {
    background-color: #f3e5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: #9c27b0;
}

.theme-chazi code:hover {
    background-color: #e1bee7;
}

.theme-chazi pre {
    background-color: #f3e5f5;
    border: 1px solid #e1bee7;
    border-radius: 4px;
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 20px;
}

.theme-chazi pre code {
    background-color: transparent;
    padding: 0;
    color: #333;
}`,
            'jinbi': `.theme-jinbi {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    margin: 0 auto;
    padding: 24px;
    background-color: #fff;
}

.theme-jinbi h1,
.theme-jinbi h2,
.theme-jinbi h3 {
    font-weight: 600;
    line-height: 1.4;
    margin-top: 32px;
    margin-bottom: 16px;
    color: #1976d2;
}

.theme-jinbi h1 {
    font-size: 2em;
    text-align: center;
}

.theme-jinbi h2 {
    font-size: 1.5em;
    border-bottom: 2px solid #bbdefb;
    padding-bottom: 8px;
}

.theme-jinbi p {
    margin-bottom: 20px;
}

.theme-jinbi blockquote {
    border-left: 4px solid #1976d2;
    padding: 16px;
    margin-bottom: 20px;
    color: #666;
    background-color: #bbdefb;
    border-radius: 0 4px 4px 0;
    box-shadow: 0 2px 4px rgba(25,118,210,0.05);
}

.theme-jinbi table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid #bbdefb;
}

.theme-jinbi th, .theme-jinbi td {
    border: 1px solid #bbdefb;
    padding: 12px;
    text-align: left;
}

.theme-jinbi th {
    background-color: #bbdefb;
    font-weight: 600;
}

.theme-jinbi tr:nth-child(even) {
    background-color: #f5f9ff;
}

.theme-jinbi a {
    color: #1976d2;
    text-decoration: none;
}

.theme-jinbi a:hover {
    text-decoration: underline;
}

.theme-jinbi img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(25,118,210,0.1);
}

.theme-jinbi img:hover {
    box-shadow: 0 4px 12px rgba(25,118,210,0.15);
}

.theme-jinbi code {
    background-color: #bbdefb;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: #1976d2;
}

.theme-jinbi code:hover {
    background-color: #90caf9;
}

.theme-jinbi pre {
    background-color: #bbdefb;
    border: 1px solid #90caf9;
    border-radius: 4px;
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 20px;
}

.theme-jinbi pre code {
    background-color: transparent;
    padding: 0;
    color: #333;
}`,
            'lvyi': `.theme-lvyi {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    margin: 0 auto;
    padding: 24px;
    background-color: #f1f8e9;
}

.theme-lvyi h1,
.theme-lvyi h2,
.theme-lvyi h3 {
    font-weight: 600;
    line-height: 1.4;
    margin-top: 32px;
    margin-bottom: 16px;
    color: #388e3c;
}

.theme-lvyi h1 {
    font-size: 2em;
    text-align: center;
}

.theme-lvyi h2 {
    font-size: 1.5em;
    border-bottom: 2px solid #c8e6c9;
    padding-bottom: 8px;
}

.theme-lvyi p {
    margin-bottom: 20px;
}

.theme-lvyi blockquote {
    border-left: 4px solid #388e3c;
    padding: 16px;
    margin-bottom: 20px;
    color: #666;
    background-color: #c8e6c9;
    border-radius: 0 4px 4px 0;
    box-shadow: 0 2px 4px rgba(56,142,60,0.05);
}

.theme-lvyi table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid #c8e6c9;
}

.theme-lvyi th, .theme-lvyi td {
    border: 1px solid #c8e6c9;
    padding: 12px;
    text-align: left;
}

.theme-lvyi th {
    background-color: #c8e6c9;
    font-weight: 600;
}

.theme-lvyi tr:nth-child(even) {
    background-color: #f1f8e9;
}

.theme-lvyi a {
    color: #388e3c;
    text-decoration: none;
}

.theme-lvyi a:hover {
    text-decoration: underline;
}

.theme-lvyi img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(56,142,60,0.1);
}

.theme-lvyi img:hover {
    box-shadow: 0 4px 12px rgba(56,142,60,0.15);
}

.theme-lvyi code {
    background-color: #c8e6c9;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: #388e3c;
}

.theme-lvyi code:hover {
    background-color: #a5d6a7;
}

.theme-lvyi pre {
    background-color: #c8e6c9;
    border: 1px solid #a5d6a7;
    border-radius: 4px;
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 20px;
}

.theme-lvyi pre code {
    background-color: transparent;
    padding: 0;
    color: #333;
}`,
            'hongying': `.theme-hongying {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    margin: 0 auto;
    padding: 24px;
    background-color: #fff5f5;
}

.theme-hongying h1,
.theme-hongying h2,
.theme-hongying h3 {
    font-weight: 600;
    line-height: 1.4;
    margin-top: 32px;
    margin-bottom: 16px;
    color: #e53935;
}

.theme-hongying h1 {
    font-size: 2em;
    text-align: center;
}

.theme-hongying h2 {
    font-size: 1.5em;
    border-bottom: 2px solid #ffcdd2;
    padding-bottom: 8px;
}

.theme-hongying p {
    margin-bottom: 20px;
}

.theme-hongying blockquote {
    border-left: 4px solid #e53935;
    padding: 16px;
    margin-bottom: 20px;
    color: #666;
    background-color: #ffcdd2;
    border-radius: 0 4px 4px 0;
    box-shadow: 0 2px 4px rgba(229,57,53,0.05);
}

.theme-hongying table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid #ffcdd2;
}

.theme-hongying th, .theme-hongying td {
    border: 1px solid #ffcdd2;
    padding: 12px;
    text-align: left;
}

.theme-hongying th {
    background-color: #ffcdd2;
    font-weight: 600;
}

.theme-hongying tr:nth-child(even) {
    background-color: #fff5f5;
}

.theme-hongying a {
    color: #e53935;
    text-decoration: none;
}

.theme-hongying a:hover {
    text-decoration: underline;
}

.theme-hongying img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(229,57,53,0.1);
}

.theme-hongying img:hover {
    box-shadow: 0 4px 12px rgba(229,57,53,0.15);
}

.theme-hongying code {
    background-color: #ffcdd2;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: #e53935;
}

.theme-hongying code:hover {
    background-color: #ef9a9a;
}

.theme-hongying pre {
    background-color: #ffcdd2;
    border: 1px solid #ef9a9a;
    border-radius: 4px;
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 20px;
}

.theme-hongying pre code {
    background-color: transparent;
    padding: 0;
    color: #333;
}`,
            'lanqing': `.theme-lanqing {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    margin: 0 auto;
    padding: 24px;
    background-color: #e3f2fd;
}

.theme-lanqing h1,
.theme-lanqing h2,
.theme-lanqing h3 {
    font-weight: 600;
    line-height: 1.4;
    margin-top: 32px;
    margin-bottom: 16px;
    color: #1565c0;
}

.theme-lanqing h1 {
    font-size: 2em;
    text-align: center;
}

.theme-lanqing h2 {
    font-size: 1.5em;
    border-bottom: 2px solid #90caf9;
    padding-bottom: 8px;
}

.theme-lanqing p {
    margin-bottom: 20px;
}

.theme-lanqing blockquote {
    border-left: 4px solid #1565c0;
    padding: 16px;
    margin-bottom: 20px;
    color: #666;
    background-color: #90caf9;
    border-radius: 0 4px 4px 0;
    box-shadow: 0 2px 4px rgba(21,101,192,0.05);
}

.theme-lanqing table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid #90caf9;
}

.theme-lanqing th, .theme-lanqing td {
    border: 1px solid #90caf9;
    padding: 12px;
    text-align: left;
}

.theme-lanqing th {
    background-color: #90caf9;
    font-weight: 600;
}

.theme-lanqing tr:nth-child(even) {
    background-color: #e3f2fd;
}

.theme-lanqing a {
    color: #1565c0;
    text-decoration: none;
}

.theme-lanqing a:hover {
    text-decoration: underline;
}

.theme-lanqing img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(21,101,192,0.1);
}

.theme-lanqing img:hover {
    box-shadow: 0 4px 12px rgba(21,101,192,0.15);
}

.theme-lanqing code {
    background-color: #90caf9;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: #1565c0;
}

.theme-lanqing code:hover {
    background-color: #64b5f6;
}

.theme-lanqing pre {
    background-color: #90caf9;
    border: 1px solid #64b5f6;
    border-radius: 4px;
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 20px;
}

.theme-lanqing pre code {
    background-color: transparent;
    padding: 0;
    color: #333;
}`,
            'keji': `.theme-keji {
    font-family: 'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    color: #e0e0e0;
    margin: 0 auto;
    padding: 24px;
    background-color: #1e1e1e;
}

.theme-keji h1,
.theme-keji h2,
.theme-keji h3 {
    font-weight: 700;
    line-height: 1.4;
    margin-top: 32px;
    margin-bottom: 16px;
    color: #61dafb;
}

.theme-keji h1 {
    font-size: 2em;
    text-align: center;
    border-bottom: 2px solid #61dafb;
    padding-bottom: 12px;
}

.theme-keji h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #61dafb;
    padding-bottom: 8px;
}

.theme-keji p {
    margin-bottom: 20px;
}

.theme-keji blockquote {
    border-left: 4px solid #61dafb;
    padding: 16px;
    margin-bottom: 20px;
    color: #b0b0b0;
    background-color: #2d2d2d;
    border-radius: 0 4px 4px 0;
    box-shadow: 0 2px 4px rgba(97,218,251,0.05);
}

.theme-keji table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid #3d3d3d;
}

.theme-keji th, .theme-keji td {
    border: 1px solid #3d3d3d;
    padding: 12px;
    text-align: left;
}

.theme-keji th {
    background-color: #2d2d2d;
    font-weight: 600;
}

.theme-keji tr:nth-child(even) {
    background-color: #252525;
}

.theme-keji a {
    color: #61dafb;
    text-decoration: none;
}

.theme-keji a:hover {
    text-decoration: underline;
}

.theme-keji img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(97,218,251,0.1);
}

.theme-keji img:hover {
    box-shadow: 0 4px 12px rgba(97,218,251,0.15);
}

.theme-keji code {
    background-color: #2d2d2d;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace;
    font-size: 0.9em;
    color: #61dafb;
}

.theme-keji code:hover {
    background-color: #3d3d3d;
}

.theme-keji pre {
    background-color: #2d2d2d;
    border: 1px solid #3d3d3d;
    border-radius: 4px;
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 20px;
}

.theme-keji pre code {
    background-color: transparent;
    padding: 0;
    color: #e0e0e0;
}`
        };
    }

    openCssSidebar(themeName = '', css = '') {
        if (!this.cssSidebar) return;
        this.cssSidebar.classList.add('open');
        
        const currentTheme = this.previewTheme ? this.previewTheme.value : 'default';
        
        if (this.customThemeName) {
            if (themeName) {
                this.customThemeName.value = themeName;
            } else if (currentTheme.startsWith('custom-')) {
                const name = currentTheme.replace('custom-', '');
                this.customThemeName.value = name;
            } else {
                this.customThemeName.value = this.themeNameMap[currentTheme] || currentTheme;
            }
        }
        
        this.originalThemeName = this.customThemeName ? this.customThemeName.value : '';
        this.isEditingCustomTheme = currentTheme.startsWith('custom-');
        
        if (this.customThemeDelete) {
            this.customThemeDelete.style.display = this.isEditingCustomTheme ? 'inline-block' : 'none';
        }
        
        if (this.customThemeCss) {
            if (css) {
                this.customThemeCss.value = css;
            } else {
                const currentTheme = this.previewTheme ? this.previewTheme.value : 'default';
                
                if (currentTheme.startsWith('custom-')) {
                    const themeName = currentTheme.replace('custom-', '');
                    const customTheme = this.customThemes[themeName];
                    if (customTheme && customTheme.css) {
                        this.customThemeCss.value = customTheme.css;
                    } else {
                        this.customThemeCss.value = `/*自定义样式，实时生效*/

/* 全局属性
* 页边距 padding:30px;
* 全文字体 font-family:optima-Regular;
* 英文换行 word-break:break-all;
color:#2b2b2b;
*/
.preview-content {
  line-height: 1.25;
  color: #2b2b2b;
  font-family: Optima-Regular, Optima, PingFangTC-Light, PingFangSC-light, PingFangTC-light;
  letter-spacing: 2px;
  background-image: linear-gradient(90deg, rgba(50, 0, 0, 0.04) 3%, rgba(0, 0, 0, 0) 3%), linear-gradient(360deg, rgba(50, 0, 0, 0.04) 3%, rgba(0, 0, 0, 0) 3%);
  background-size: 20px 20px;
  background-position: center center;
  padding: 5px;
}`;
                    }
                } else if (currentTheme !== 'default' && this.themeCssMap && this.themeCssMap[currentTheme]) {
                    this.customThemeCss.value = this.themeCssMap[currentTheme];
                } else {
                    this.customThemeCss.value = `/*自定义样式，实时生效*/

/* 全局属性
* 页边距 padding:30px;
* 全文字体 font-family:optima-Regular;
* 英文换行 word-break:break-all;
color:#2b2b2b;
*/
.preview-content {
  line-height: 1.25;
  color: #2b2b2b;
  font-family: Optima-Regular, Optima, PingFangTC-Light, PingFangSC-light, PingFangTC-light;
  letter-spacing: 2px;
  background-image: linear-gradient(90deg, rgba(50, 0, 0, 0.04) 3%, rgba(0, 0, 0, 0) 3%), linear-gradient(360deg, rgba(50, 0, 0, 0.04) 3%, rgba(0, 0, 0, 0) 3%);
  background-size: 20px 20px;
  background-position: center center;
  padding: 5px;
}`;
                }
            }
        }
        
        this.setupRealTimePreview();
    }

    setupRealTimePreview() {
        if (!this.customThemeCss) return;
        
        if (this.cssInputHandler) {
            this.customThemeCss.removeEventListener('input', this.cssInputHandler);
        }
        
        this.cssInputHandler = () => {
            this.applyRealTimeCss();
        };
        
        this.customThemeCss.addEventListener('input', this.cssInputHandler);
    }

    applyRealTimeCss() {
        if (!this.customThemeCss || !this.previewOutput) return;
        
        const css = this.customThemeCss.value.trim();
        
        let existingStyle = document.getElementById('realtime-preview-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        if (css) {
            const styleElement = document.createElement('style');
            styleElement.id = 'realtime-preview-style';
            styleElement.textContent = css;
            document.head.appendChild(styleElement);
        }
    }

    closeCssSidebar() {
        if (this.cssSidebar) {
            this.cssSidebar.classList.remove('open');
        }
        
        if (this.customThemeCss && this.cssInputHandler) {
            this.customThemeCss.removeEventListener('input', this.cssInputHandler);
        }
        
        const existingStyle = document.getElementById('realtime-preview-style');
        if (existingStyle) {
            existingStyle.remove();
        }
    }

    saveCustomTheme() {
        if (!this.customThemeName || !this.customThemeCss) return;
        
        const themeName = this.customThemeName.value.trim();
        let css = this.customThemeCss.value.trim();
        
        if (!themeName) {
            alert('请输入主题名称');
            return;
        }
        
        const currentTheme = this.previewTheme ? this.previewTheme.value : 'default';
        let baseTheme = 'default';
        
        if (this.isEditingCustomTheme && this.originalThemeName) {
            const existingTheme = this.customThemes[this.originalThemeName];
            if (existingTheme && existingTheme.baseTheme) {
                baseTheme = existingTheme.baseTheme;
            }
        } else if (!currentTheme.startsWith('custom-')) {
            baseTheme = currentTheme;
        }
        
        const realtimeStyle = document.getElementById('realtime-preview-style');
        if (realtimeStyle && realtimeStyle.textContent) {
            css = realtimeStyle.textContent;
        }
        
        this.customThemes[themeName] = { css, baseTheme };
        localStorage.setItem('custom-themes', JSON.stringify(this.customThemes));
        
        this.loadPreviewTheme();
        
        const themeValue = `custom-${themeName}`;
        this.previewTheme.value = themeValue;
        
        this.setPreviewTheme(themeValue);
        
        this.closeCssSidebar();
        
        if (themeName === this.originalThemeName) {
            alert('自定义主题更新成功！');
        } else {
            alert('自定义主题保存成功！');
        }
    }

    deleteCustomTheme() {
        if (!this.originalThemeName) return;
        
        if (confirm(`确定要删除自定义主题 "${this.originalThemeName}" 吗？`)) {
            delete this.customThemes[this.originalThemeName];
            localStorage.setItem('custom-themes', JSON.stringify(this.customThemes));
            this.loadPreviewTheme();
            this.closeCssSidebar();
            alert('自定义主题已删除！');
        }
    }
}

// 初始化编辑器
window.addEventListener('DOMContentLoaded', () => {
    if (!window.markdownEditor) {
        window.markdownEditor = new MarkdownEditor();
    }
});

// 窗口大小变化时调整编辑器高度
window.addEventListener('resize', () => {
    if (window.markdownEditor && window.markdownEditor.easyMDE) {
        const cm = window.markdownEditor.easyMDE.codemirror;
        cm.refresh();
    }
});
