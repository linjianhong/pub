@echo off
@echo.
@echo.
@echo.
@echo.         ��ѡ��Ҫִ�еĲ���
@echo.
@echo           [1] ���ع���      gulp build
@echo           [2] ������������  gulp clean
@echo           [3] �˳�
@echo.
@echo         ����: 1 �� 2 �󰴻س�
@echo.
@echo         ֱ�Ӱ��س����˳�
@echo.
@echo off
set /p n=ѡ��:

if %n%==1 goto build
if %n%==2 goto clean
if %n%==3 goto end
goto end


:build
@echo.
@echo ѡ����: build
@echo.
cd www
gulp build
goto end

:clean
@echo.
@echo ѡ����: clean
@echo.
cd www
gulp clean
goto end


:end